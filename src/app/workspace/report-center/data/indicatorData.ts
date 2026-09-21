// ==================== 预警执行指标库数据 ====================
import { IndicatorDefinition, IndicatorCategoryNode, DataFormat } from './types';

// ---------- 指标分类树 ----------
export const INDICATOR_CATEGORY_TREE: IndicatorCategoryNode[] = [
  {
    id: '01', name: '基础预警指标', count: 10,
  },
  {
    id: '02', name: '在线执行指标', count: 18,
    children: [
      { id: '0201', name: '在线执行统计', count: 6 },
      { id: '0202', name: '外显10086执行情况', count: 3 },
      { id: '0203', name: '特定专席渠道执行情况', count: 3 },
      { id: '0204', name: '重复工单', count: 1 },
      { id: '0205', name: '在线预警工单执行时效统计', count: 6 },
    ],
  },
  {
    id: '03', name: '网格经理执行指标', count: 16,
    children: [
      { id: '0301', name: '网格经理执行统计', count: 7 },
      { id: '0302', name: '网格经理执行时效统计', count: 9 },
    ],
  },
  {
    id: '04', name: '地市集运执行指标', count: 14,
  },
  {
    id: '05', name: '10088执行指标', count: 14,
    children: [
      { id: '0501', name: '10088执行统计', count: 7 },
      { id: '0502', name: '10088执行时效统计', count: 7 },
    ],
  },
  {
    id: '06', name: '政企客户经理执行指标', count: 8,
    children: [
      { id: '0601', name: '政企客户经理执行统计', count: 3 },
      { id: '0602', name: '政企客户经理执行时效统计', count: 5 },
    ],
  },
  {
    id: '07', name: '装维人员执行指标', count: 12,
    children: [
      { id: '0701', name: '装维人员执行统计', count: 7 },
      { id: '0702', name: '装维人员执行时效统计', count: 5 },
    ],
  },
  {
    id: '08', name: '投诉专项指标', count: 16,
    children: [
      { id: '0801', name: '工单类型', count: 3 },
      { id: '0802', name: '投诉类型', count: 8 },
      { id: '0803', name: '执行成功细分', count: 4 },
      { id: '0804', name: '其他执行结果细分', count: 2 },
    ],
  },
  {
    id: '09', name: '时效分档模板', count: 3,
  },
];

// ---------- 完整指标列表 ----------
export const INDICATOR_DEFINITIONS: IndicatorDefinition[] = [
  // ===== 01 基础预警指标 =====
  { indicatorCode: 'A0101', indicatorName: '预警触发数', categoryId: '01', categoryName: '基础预警指标', caliber: '满足预警条件的客户数，含已发送预警工单和待发送工单', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '预警管理模块', computeLogic: "COUNT(warning_id) WHERE status='triggered'", unit: '户', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0102', indicatorName: '执行完成数', categoryId: '01', categoryName: '基础预警指标', caliber: '已反馈执行结果的工单数（含成功+拒绝+未接通）', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE exec_status IN ('success','rejected','unreached')", unit: '户', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0103', indicatorName: '执行成功数', categoryId: '01', categoryName: '基础预警指标', caliber: '客户接受维系方案且未离网/携转的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE exec_status='success'", unit: '户', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0104', indicatorName: '执行中', categoryId: '01', categoryName: '基础预警指标', caliber: '已下发但尚未反馈执行结果的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE exec_status='in_progress'", unit: '户', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0105', indicatorName: '未执行数', categoryId: '01', categoryName: '基础预警指标', caliber: '已下发但执行人员尚未领取/处理的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE exec_status='pending'", unit: '户', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0106', indicatorName: '维系前已携转客户数', categoryId: '01', categoryName: '基础预警指标', caliber: '预警触发后、执行前已完成号码携出的客户数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: 'CRM系统', computeLogic: "COUNT(customer_id) WHERE port_out_time BETWEEN trigger_time AND first_exec_time", unit: '户', applicableScenario: ['port_out_warning'], isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0107', indicatorName: '维系前已离网客户数', categoryId: '01', categoryName: '基础预警指标', caliber: '预警触发后、执行前已完成离网的客户数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: 'CRM系统', computeLogic: "COUNT(customer_id) WHERE churn_time BETWEEN trigger_time AND first_exec_time", unit: '户', applicableScenario: ['global_pass_churn_warning'], isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0108', indicatorName: '维系前状态异常客户数', categoryId: '01', categoryName: '基础预警指标', caliber: '预警触发后客户状态异常（停机/半停）的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: 'CRM系统', computeLogic: "COUNT(customer_id) WHERE customer_status IN ('suspended','half_suspended')", unit: '户', applicableScenario: ['global_pass_churn_warning'], isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0109', indicatorName: '携出客户数', categoryId: '01', categoryName: '基础预警指标', caliber: '统计周期内已完成号码携出的客户数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: 'CRM系统', computeLogic: "COUNT(customer_id) WHERE port_out_status='completed'", unit: '户', applicableScenario: ['port_out_warning'], isGroupHeader: false, status: 'active' },
  { indicatorCode: 'A0110', indicatorName: '离网客户数', categoryId: '01', categoryName: '基础预警指标', caliber: '统计周期内已完成离网的客户数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: 'CRM系统', computeLogic: "COUNT(customer_id) WHERE churn_status='completed'", unit: '户', applicableScenario: ['global_pass_churn_warning'], isGroupHeader: false, status: 'active' },

  // ===== 02 在线执行指标 =====
  // 0201 在线执行统计
  { indicatorCode: 'B020101', indicatorName: '在线工单数', categoryId: '02', categoryName: '在线执行指标', caliber: '通过在线渠道下发的预警工单总数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020102', indicatorName: '在线未执行数', categoryId: '02', categoryName: '在线执行指标', caliber: '在线渠道工单中未触达客户的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND exec_status='pending'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020103', indicatorName: '在线执行中数', categoryId: '02', categoryName: '在线执行指标', caliber: '已触达但客户尚未反馈的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND exec_status='in_progress'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020104', indicatorName: '在线执行完成数', categoryId: '02', categoryName: '在线执行指标', caliber: '客户已明确反馈的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND exec_status='completed'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020105', indicatorName: '在线执行成功数', categoryId: '02', categoryName: '在线执行指标', caliber: '客户接受维系方案的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND exec_status='success'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020106', indicatorName: '在线拒绝数', categoryId: '02', categoryName: '在线执行指标', caliber: '客户明确拒绝的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND exec_status='rejected'", unit: '个', parentGroupId: '0201', isGroupHeader: false, status: 'active' },

  // 0202 外显10086
  { indicatorCode: 'B020201', indicatorName: '10086执行成功数', categoryId: '02', categoryName: '在线执行指标', caliber: '10086外呼触达且客户接受维系方案的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10086外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10086' AND exec_status='success'", unit: '个', parentGroupId: '0202', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020202', indicatorName: '10086未接通数', categoryId: '02', categoryName: '在线执行指标', caliber: '10086外呼未接通（含关机/无人接听/忙线）的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10086外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10086' AND exec_status='unreached'", unit: '个', parentGroupId: '0202', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020203', indicatorName: '10086拒绝数', categoryId: '02', categoryName: '在线执行指标', caliber: '10086外呼接通后客户明确拒绝的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10086外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10086' AND exec_status='rejected'", unit: '个', parentGroupId: '0202', isGroupHeader: false, status: 'active' },

  // 0203 特定专席
  { indicatorCode: 'B020301', indicatorName: '专席执行成功数', categoryId: '02', categoryName: '在线执行指标', caliber: '特定专席外呼触达且客户接受维系方案的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='special_seat' AND exec_status='success'", unit: '个', parentGroupId: '0203', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020302', indicatorName: '专席未接通数', categoryId: '02', categoryName: '在线执行指标', caliber: '特定专席外呼未接通的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='special_seat' AND exec_status='unreached'", unit: '个', parentGroupId: '0203', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020303', indicatorName: '专席拒绝数', categoryId: '02', categoryName: '在线执行指标', caliber: '特定专席外呼接通后客户明确拒绝的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='special_seat' AND exec_status='rejected'", unit: '个', parentGroupId: '0203', isGroupHeader: false, status: 'active' },

  // 0204 重复工单
  { indicatorCode: 'B020401', indicatorName: '重复工单数', categoryId: '02', categoryName: '在线执行指标', caliber: '在线返回重复工单+在线登记数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE is_duplicate=true", unit: '个', parentGroupId: '0204', isGroupHeader: false, status: 'active' },

  // 0205 在线时效(快速响应档)
  { indicatorCode: 'B020501', indicatorName: '在线≤30分钟', categoryId: '02', categoryName: '在线执行指标', caliber: '从在线预警工单下发起至首次触达客户≤30分钟', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time <= INTERVAL '30 minutes'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020502', indicatorName: '在线30-60分钟', categoryId: '02', categoryName: '在线执行指标', caliber: '首次触达客户耗时30-60分钟', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time BETWEEN INTERVAL '30 minutes' AND INTERVAL '60 minutes'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020503', indicatorName: '在线60-120分钟', categoryId: '02', categoryName: '在线执行指标', caliber: '首次触达客户耗时60-120分钟', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time BETWEEN INTERVAL '60 minutes' AND INTERVAL '120 minutes'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020504', indicatorName: '在线2-12小时', categoryId: '02', categoryName: '在线执行指标', caliber: '首次触达客户耗时2-12小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time BETWEEN INTERVAL '2 hours' AND INTERVAL '12 hours'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020505', indicatorName: '在线12-24小时', categoryId: '02', categoryName: '在线执行指标', caliber: '首次触达客户耗时12-24小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time BETWEEN INTERVAL '12 hours' AND INTERVAL '24 hours'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'B020506', indicatorName: '在线24小时以上', categoryId: '02', categoryName: '在线执行指标', caliber: '首次触达客户耗时超过24小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '在线渠道执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='online' AND first_reach_time - create_time > INTERVAL '24 hours'", unit: '个', parentGroupId: '0205', timeBucketType: 'fast_response', isGroupHeader: false, status: 'active' },

  // ===== 03 网格经理执行指标 =====
  { indicatorCode: 'C030101', indicatorName: '网格经理工单数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '分配给网格经理的预警工单总数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030102', indicatorName: '网格经理未执行数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理尚未领取/处理的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='pending'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030103', indicatorName: '网格经理执行中数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理已领取但尚未反馈结果的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='in_progress'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030104', indicatorName: '网格经理执行完成数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理已反馈执行结果的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='completed'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030105', indicatorName: '网格经理执行成功数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理反馈客户接受维系方案的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='success'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030106', indicatorName: '网格经理拒绝数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理反馈客户明确拒绝的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='rejected'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030107', indicatorName: '网格经理转派数', categoryId: '03', categoryName: '网格经理执行指标', caliber: '网格经理将工单转派给其他渠道/人员的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND exec_status='transferred'", unit: '个', parentGroupId: '0301', isGroupHeader: false, status: 'active' },

  // 网格经理时效(标准响应档)
  { indicatorCode: 'C030201', indicatorName: '网格经理≤2小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '从工单下发给网格经理起至首次触达客户≤2小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time <= INTERVAL '2 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'standard_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030202', indicatorName: '网格经理2-6小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达耗时2-6小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time BETWEEN INTERVAL '2 hours' AND INTERVAL '6 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'standard_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030203', indicatorName: '网格经理6-24小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达耗时6-24小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time BETWEEN INTERVAL '6 hours' AND INTERVAL '24 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'standard_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030204', indicatorName: '网格经理24-48小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达耗时24-48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time BETWEEN INTERVAL '24 hours' AND INTERVAL '48 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'standard_response', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030205', indicatorName: '网格经理>48小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达耗时超过48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time > INTERVAL '48 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'standard_response', isGroupHeader: false, status: 'active' },

  // 网格经理时效(长周期响应档)
  { indicatorCode: 'C030211', indicatorName: '网格经理≤48小时', categoryId: '03', categoryName: '网格经理执行指标', caliber: '从工单下发至首次触达≤48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time <= INTERVAL '48 hours'", unit: '个', parentGroupId: '0302', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030212', indicatorName: '网格经理≤7天', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达≤7天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time <= INTERVAL '7 days'", unit: '个', parentGroupId: '0302', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030213', indicatorName: '网格经理≤15天', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达≤15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time <= INTERVAL '15 days'", unit: '个', parentGroupId: '0302', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'C030214', indicatorName: '网格经理>15天', categoryId: '03', categoryName: '网格经理执行指标', caliber: '首次触达超过15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='grid_manager' AND first_reach_time - create_time > INTERVAL '15 days'", unit: '个', parentGroupId: '0302', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },

  // ===== 04 地市集运执行指标 =====
  { indicatorCode: 'D040101', indicatorName: '地市集运工单数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '分配给地市集运的预警工单总数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040102', indicatorName: '地市集运认领数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '地市集运人员主动认领的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND claim_status='claimed'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040103', indicatorName: '地市集运执行数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '地市集运人员已执行的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND exec_status IN ('completed','success','rejected')", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040104', indicatorName: '地市集运呼通数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '地市集运外呼接通的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND call_status='connected'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040105', indicatorName: '地市集运有效执行数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '外呼接通且客户反馈有效的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND call_status='connected' AND exec_status IN ('success','rejected')", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040106', indicatorName: '地市集运48小时内有效执行数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '工单下发48小时内完成有效执行的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND effective_exec_time - create_time <= INTERVAL '48 hours'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040107', indicatorName: '地市集运认领率', categoryId: '04', categoryName: '地市集运执行指标', caliber: '认领数/工单数×100%', applicableDimensions: ['province','city','district'], dataType: 'percent', dataSource: '集运调度系统', computeLogic: 'D040102 / D040101 * 100', unit: '%', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040108', indicatorName: '地市集运执行率', categoryId: '04', categoryName: '地市集运执行指标', caliber: '执行数/认领数×100%', applicableDimensions: ['province','city','district'], dataType: 'percent', dataSource: '集运调度系统', computeLogic: 'D040103 / D040102 * 100', unit: '%', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040109', indicatorName: '地市集运呼通率', categoryId: '04', categoryName: '地市集运执行指标', caliber: '呼通数/执行数×100%', applicableDimensions: ['province','city','district'], dataType: 'percent', dataSource: '集运调度系统', computeLogic: 'D040104 / D040103 * 100', unit: '%', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040110', indicatorName: '地市集运有效执行率', categoryId: '04', categoryName: '地市集运执行指标', caliber: '有效执行数/呼通数×100%', applicableDimensions: ['province','city','district'], dataType: 'percent', dataSource: '集运调度系统', computeLogic: 'D040105 / D040104 * 100', unit: '%', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040111', indicatorName: '地市集运48小时内有效执行率', categoryId: '04', categoryName: '地市集运执行指标', caliber: '48小时内有效执行数/有效执行数×100%', applicableDimensions: ['province','city','district'], dataType: 'percent', dataSource: '集运调度系统', computeLogic: 'D040106 / D040105 * 100', unit: '%', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040112', indicatorName: '地市集运转派数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '地市集运将工单转派给其他渠道的数量', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND exec_status='transferred'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040113', indicatorName: '地市集运转派至网格经理数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '转派目标为网格经理的数量', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND exec_status='transferred' AND transfer_target='grid_manager'", unit: '个', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'D040114', indicatorName: '地市集运转派至装维数', categoryId: '04', categoryName: '地市集运执行指标', caliber: '转派目标为装维人员的数量', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '集运调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='city_operation' AND exec_status='transferred' AND transfer_target='installer'", unit: '个', isGroupHeader: false, status: 'active' },

  // ===== 05 10088执行指标 =====
  { indicatorCode: 'E050101', indicatorName: '10088工单数', categoryId: '05', categoryName: '10088执行指标', caliber: '分配给10088外呼的预警工单总数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050102', indicatorName: '10088未执行数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中未触达客户的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='pending'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050103', indicatorName: '10088执行中数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中已触达但客户尚未反馈的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='in_progress'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050104', indicatorName: '10088执行完成数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中客户已明确反馈的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='completed'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050105', indicatorName: '10088执行成功数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中客户接受维系方案的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='success'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050106', indicatorName: '10088拒绝数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中客户明确拒绝的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='rejected'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050107', indicatorName: '10088转派数', categoryId: '05', categoryName: '10088执行指标', caliber: '10088渠道工单中转派给其他渠道的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND exec_status='transferred'", unit: '个', parentGroupId: '0501', isGroupHeader: false, status: 'active' },

  // 10088时效(长周期响应档)
  { indicatorCode: 'E050201', indicatorName: '10088≤48小时', categoryId: '05', categoryName: '10088执行指标', caliber: '从工单下发至首次触达≤48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND first_reach_time - create_time <= INTERVAL '48 hours'", unit: '个', parentGroupId: '0502', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050202', indicatorName: '10088≤7天', categoryId: '05', categoryName: '10088执行指标', caliber: '首次触达≤7天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND first_reach_time - create_time <= INTERVAL '7 days'", unit: '个', parentGroupId: '0502', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050203', indicatorName: '10088≤15天', categoryId: '05', categoryName: '10088执行指标', caliber: '首次触达≤15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND first_reach_time - create_time <= INTERVAL '15 days'", unit: '个', parentGroupId: '0502', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'E050204', indicatorName: '10088>15天', categoryId: '05', categoryName: '10088执行指标', caliber: '首次触达超过15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '10088外呼系统', computeLogic: "COUNT(ticket_id) WHERE channel='10088' AND first_reach_time - create_time > INTERVAL '15 days'", unit: '个', parentGroupId: '0502', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },

  // ===== 06 政企客户经理执行指标 =====
  { indicatorCode: 'F060101', indicatorName: '政企工单数', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '分配给政企客户经理的预警工单总数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager'", unit: '个', parentGroupId: '0601', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'F060102', indicatorName: '政企未反馈数', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '政企客户经理尚未反馈执行结果的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager' AND exec_status='pending'", unit: '个', parentGroupId: '0601', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'F060103', indicatorName: '政企反馈数', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '政企客户经理已反馈执行结果的工单数', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager' AND exec_status IN ('completed','success','rejected')", unit: '个', parentGroupId: '0601', isGroupHeader: false, status: 'active' },
  // 政企时效(长周期响应档)
  { indicatorCode: 'F060201', indicatorName: '政企≤7天', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '首次触达≤7天', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager' AND first_reach_time - create_time <= INTERVAL '7 days'", unit: '个', parentGroupId: '0602', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'F060202', indicatorName: '政企≤15天', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '首次触达≤15天', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager' AND first_reach_time - create_time <= INTERVAL '15 days'", unit: '个', parentGroupId: '0602', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'F060203', indicatorName: '政企>15天', categoryId: '06', categoryName: '政企客户经理执行指标', caliber: '首次触达超过15天', applicableDimensions: ['province','city','district'], dataType: 'integer', dataSource: '工单执行系统', computeLogic: "COUNT(ticket_id) WHERE channel='enterprise_manager' AND first_reach_time - create_time > INTERVAL '15 days'", unit: '个', parentGroupId: '0602', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },

  // ===== 07 装维人员执行指标 =====
  { indicatorCode: 'G070101', indicatorName: '装维工单数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '分配给装维人员的预警工单总数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070102', indicatorName: '装维未执行数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '装维人员尚未领取/处理的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='pending'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070103', indicatorName: '装维执行中数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '装维人员已领取但尚未反馈结果的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='in_progress'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070104', indicatorName: '装维执行完成数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '装维人员已反馈执行结果的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='completed'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070105', indicatorName: '装维成功数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '装维人员上门服务且问题解决的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='success'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070106', indicatorName: '装维失败数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '装维人员上门服务但未能解决的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='failed'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070107', indicatorName: '装维拒绝数', categoryId: '07', categoryName: '装维人员执行指标', caliber: '客户拒绝装维上门服务的数量', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND exec_status='rejected'", unit: '个', parentGroupId: '0701', isGroupHeader: false, status: 'active' },
  // 装维时效(长周期响应档)
  { indicatorCode: 'G070201', indicatorName: '装维≤48小时', categoryId: '07', categoryName: '装维人员执行指标', caliber: '从工单下发至首次触达≤48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND first_reach_time - create_time <= INTERVAL '48 hours'", unit: '个', parentGroupId: '0702', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070202', indicatorName: '装维≤7天', categoryId: '07', categoryName: '装维人员执行指标', caliber: '首次触达≤7天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND first_reach_time - create_time <= INTERVAL '7 days'", unit: '个', parentGroupId: '0702', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070203', indicatorName: '装维≤15天', categoryId: '07', categoryName: '装维人员执行指标', caliber: '首次触达≤15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND first_reach_time - create_time <= INTERVAL '15 days'", unit: '个', parentGroupId: '0702', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'G070204', indicatorName: '装维>15天', categoryId: '07', categoryName: '装维人员执行指标', caliber: '首次触达超过15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '装维调度系统', computeLogic: "COUNT(ticket_id) WHERE channel='installer' AND first_reach_time - create_time > INTERVAL '15 days'", unit: '个', parentGroupId: '0702', timeBucketType: 'long_cycle', isGroupHeader: false, status: 'active' },

  // ===== 08 投诉专项指标 =====
  // 0801 工单类型
  { indicatorCode: 'H080101', indicatorName: '不满意工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '客户评价为不满意的投诉工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE satisfaction='unsatisfied'", unit: '个', parentGroupId: '0801', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080102', indicatorName: '重复工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '同一客户同一问题重复投诉的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE is_duplicate=true", unit: '个', parentGroupId: '0801', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080103', indicatorName: '超时工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '超过规定处理时限的投诉工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE is_timeout=true", unit: '个', parentGroupId: '0801', isGroupHeader: false, status: 'active' },

  // 0802 投诉类型
  { indicatorCode: 'H080201', indicatorName: '办理质疑工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为办理质疑的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='service_dispute'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080202', indicatorName: '解释差错工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为解释差错的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='explanation_error'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080203', indicatorName: '办理差错工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为办理差错的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='processing_error'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080204', indicatorName: '宽带拆机工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为宽带拆机的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='broadband_removal'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080205', indicatorName: '智家退订工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为智家退订的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='smart_home_unsubscribe'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080206', indicatorName: '装维质量工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为装维质量的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='installation_quality'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080207', indicatorName: '功能使用工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为功能使用的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='function_usage'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080208', indicatorName: '其他工单数', categoryId: '08', categoryName: '投诉专项指标', caliber: '投诉类型为其他的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE complaint_type='other'", unit: '个', parentGroupId: '0802', isGroupHeader: false, status: 'active' },

  // 0803 执行成功细分
  { indicatorCode: 'H080301', indicatorName: '已联系客服核实解决数', categoryId: '08', categoryName: '投诉专项指标', caliber: '已联系客服核实并解决的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE resolution_type='cs_verified_resolved'", unit: '个', parentGroupId: '0803', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080302', indicatorName: '已联系渠道核实/推进解决数', categoryId: '08', categoryName: '投诉专项指标', caliber: '已联系渠道核实并推进解决的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE resolution_type='channel_verified_resolved'", unit: '个', parentGroupId: '0803', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080303', indicatorName: '已联系装维核实/推进解决数', categoryId: '08', categoryName: '投诉专项指标', caliber: '已联系装维核实并推进解决的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE resolution_type='installer_verified_resolved'", unit: '个', parentGroupId: '0803', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080304', indicatorName: '已联系客服并向上一级反馈数', categoryId: '08', categoryName: '投诉专项指标', caliber: '已联系客服并向上一级反馈的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE resolution_type='cs_escalated'", unit: '个', parentGroupId: '0803', isGroupHeader: false, status: 'active' },

  // 0804 其他执行结果细分
  { indicatorCode: 'H080401', indicatorName: '未成功联系客户已联系渠道核实/推进解决数', categoryId: '08', categoryName: '投诉专项指标', caliber: '未成功联系客户但已联系渠道核实/推进解决的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE customer_reached=false AND channel_verified=true", unit: '个', parentGroupId: '0804', isGroupHeader: false, status: 'active' },
  { indicatorCode: 'H080402', indicatorName: '未成功联系客户已联系装维核实/推进解决数', categoryId: '08', categoryName: '投诉专项指标', caliber: '未成功联系客户但已联系装维核实/推进解决的工单数', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '投诉工单系统', computeLogic: "COUNT(ticket_id) WHERE customer_reached=false AND installer_verified=true", unit: '个', parentGroupId: '0804', isGroupHeader: false, status: 'active' },

  // ===== 09 时效分档模板(非数据指标，仅用于组装器自动展开) =====
  { indicatorCode: 'T0901', indicatorName: '快速响应档', categoryId: '09', categoryName: '时效分档模板', caliber: '≤30分钟/30-60分钟/60-120分钟/2-12小时/12-24小时/24小时以上', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '-', computeLogic: '-', unit: '', timeBucketType: 'fast_response', isGroupHeader: true, status: 'active' },
  { indicatorCode: 'T0902', indicatorName: '标准响应档', categoryId: '09', categoryName: '时效分档模板', caliber: '≤2小时/2-6小时/6-24小时/24-48小时/>48小时', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '-', computeLogic: '-', unit: '', timeBucketType: 'standard_response', isGroupHeader: true, status: 'active' },
  { indicatorCode: 'T0903', indicatorName: '长周期响应档', categoryId: '09', categoryName: '时效分档模板', caliber: '≤48小时/≤7天/≤15天/>15天', applicableDimensions: ['province','city','district','grid'], dataType: 'integer', dataSource: '-', computeLogic: '-', unit: '', timeBucketType: 'long_cycle', isGroupHeader: true, status: 'active' },
];

/** 按分类ID获取指标列表 */
export function getIndicatorsByCategory(categoryId: string): IndicatorDefinition[] {
  return INDICATOR_DEFINITIONS.filter(i => i.categoryId === categoryId);
}

/** 按指标编码获取指标定义 */
export function getIndicatorByCode(code: string): IndicatorDefinition | undefined {
  return INDICATOR_DEFINITIONS.find(i => i.indicatorCode === code);
}

/** 根据指标的 dataType 推断数据格式 */
export function inferDataFormat(dataType: string): 'number' | 'percent' | 'permille' | 'text' {
  switch (dataType) {
    case 'percent': return 'percent';
    case 'permille': return 'permille';
    case 'text': return 'text';
    default: return 'number';
  }
}

/** 搜索指标 */
export function searchIndicators(keyword: string): IndicatorDefinition[] {
  const lower = keyword.toLowerCase();
  return INDICATOR_DEFINITIONS.filter(
    i => i.indicatorName.toLowerCase().includes(lower) || i.indicatorCode.toLowerCase().includes(lower)
  );
}

/** 将指标 dataType 映射为 DataFormat */
export function mapDataTypeToFormat(dataType?: string): DataFormat {
  if (dataType === 'percent') return 'percent';
  if (dataType === 'integer') return 'number';
  return 'number';
}
