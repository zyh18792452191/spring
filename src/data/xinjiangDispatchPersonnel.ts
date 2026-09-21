/**
 * 新疆16地市调度人员 mock 数据
 * 供「人员匹配Agent」在指标调度 / 策略调度中使用。
 * 技能标签与 lib/dispatch-agent/mockData.ts 的 SKILL_VOCAB 对齐：
 * - 流量运营 traffic_ops: 讲解 / 外呼 / 装维
 * - 离网维系 churn_retention: 挽留话术 / 合约续约 / 价格谈判
 * - 家庭融合 home_convergence: 融合套餐讲解 / 智家产品安装 / 装维随销
 * - 中高端保有 high_value_retention: 一对一服务 / 高端权益讲解 / 投诉处理
 */
export interface XinjiangDispatchPersonnel {
  id: string;
  name: string;
  phone: string;
  department: string;
  position?: string;
  tags: string[];
  /** 评语原文，灰色地带 LLM 裁决时引用 */
  remark: string;
}

/** 新疆16地市调度人员 */
export const XINJIANG_PROVINCE_PERSONNEL: Record<string, XinjiangDispatchPersonnel[]> = {
  乌鲁木齐: [
    { id: 'wlmq-1', name: '张明远', phone: '13899000001', department: '存量运营中心', position: '营销经理', tags: ['外呼', '挽留话术', '一对一服务'], remark: '外呼转化率长期排名地市前列，客户反馈良好，沟通能力强。' },
    { id: 'wlmq-2', name: '李思涵', phone: '13899000002', department: '客户运营中心', position: '运营专员', tags: ['讲解', '高端权益讲解', '融合套餐讲解'], remark: '权益讲解专业细致，全球通客户满意度高。' },
    { id: 'wlmq-3', name: '王建国', phone: '13899000003', department: '产品运营中心', position: '销售经理', tags: ['装维', '智家产品安装', '装维随销'], remark: '装维随销能力强，智家产品安装量地市第一。' },
    { id: 'wlmq-4', name: '孙丽萍', phone: '13899000004', department: '存量运营中心', position: '运营经理', tags: ['价格谈判', '合约续约'], remark: '合约续约经验丰富，价格谈判能力突出。' },
  ],
  克拉玛依: [
    { id: 'klmy-1', name: '赵文博', phone: '13899000011', department: '存量运营中心', position: '客服专员', tags: ['挽留话术', '投诉处理'], remark: '挽留话术熟练，投诉处理耐心细致。' },
    { id: 'klmy-2', name: '钱晓峰', phone: '13899000012', department: '客户运营中心', position: '市场专员', tags: ['外呼', '讲解'], remark: '外呼执行积极，讲解清晰，新客拓展业绩良好。' },
    { id: 'klmy-3', name: '吴海燕', phone: '13899000013', department: '存量运营中心', position: '客服经理', tags: ['一对一服务', '高端权益讲解'], remark: '高端客户一对一服务经验丰富，曾获优秀服务标兵。' },
  ],
  吐鲁番: [
    { id: 'tlf-1', name: '郑凯文', phone: '13899000021', department: '客户运营中心', position: '营销总监', tags: ['外呼', '价格谈判'], remark: '价格谈判能力突出，超套客户转化率高于地市平均。' },
    { id: 'tlf-2', name: '陈雨桐', phone: '13899000022', department: '客户运营中心', position: '客服总监', tags: ['挽留话术', '一对一服务'], remark: '离网客户挽留经验丰富，挽回率排名前列。' },
  ],
  哈密: [
    { id: 'hm-1', name: '冯浩宇', phone: '13899000031', department: '产品运营中心', position: '运营总监', tags: ['融合套餐讲解', '装维随销'], remark: '家庭融合产品推广能力强，随销转化率高。' },
    { id: 'hm-2', name: '褚亮', phone: '13899000032', department: '存量运营中心', position: '营销经理', tags: ['合约续约', '外呼'], remark: '合约续约执行扎实，外呼话术规范。' },
  ],
  昌吉: [
    { id: 'cj-1', name: '卫晓明', phone: '13899000041', department: '产品运营中心', position: '运营经理', tags: ['智家产品安装', '装维随销'], remark: '智家产品安装技能过硬，随销业绩稳定。' },
    { id: 'cj-2', name: '蒋丽娟', phone: '13899000042', department: '存量运营中心', position: '销售经理', tags: ['价格谈判', '挽留话术'], remark: '谈判与挽留综合能力强，客户维护到位。' },
    { id: 'cj-3', name: '沈俊杰', phone: '13899000043', department: '客户运营中心', position: '客服专员', tags: ['外呼', '讲解'], remark: '外呼勤奋，讲解耐心，执行效率高。' },
  ],
  博州: [
    { id: 'bz-1', name: '韩磊', phone: '13899000051', department: '产品运营中心', position: '市场专员', tags: ['装维', '融合套餐讲解'], remark: '装维上门服务规范，融合套餐随销能力强。' },
    { id: 'bz-2', name: '杨帆', phone: '13899000052', department: '存量运营中心', position: '运营经理', tags: ['外呼', '合约续约'], remark: '外呼执行认真，合约续约完成率良好。' },
  ],
  巴州: [
    { id: 'baz-1', name: '朱晓东', phone: '13899000061', department: '客户运营中心', position: '销售专员', tags: ['外呼', '价格谈判'], remark: '超套唤醒外呼业绩突出，谈判技巧娴熟。' },
    { id: 'baz-2', name: '吕强', phone: '13899000062', department: '客户运营中心', position: '销售专员', tags: ['挽留话术', '高端权益讲解'], remark: '离网高风险客户挽留有效，权益讲解到位。' },
    { id: 'baz-3', name: '秦雅琴', phone: '13899000063', department: '存量运营中心', position: '客服经理', tags: ['一对一服务', '投诉处理'], remark: '高端客户专属服务经验丰富，投诉处理及时。' },
  ],
  阿克苏: [
    { id: 'aks-1', name: '尤佳宁', phone: '13899000071', department: '产品运营中心', position: '营销总监', tags: ['融合套餐讲解', '智家产品安装'], remark: '家庭融合业务营销能力突出，套餐讲解清晰。' },
    { id: 'aks-2', name: '许志鹏', phone: '13899000072', department: '存量运营中心', position: '运营总监', tags: ['挽留话术', '合约续约'], remark: '离网维系经验丰富，挽留方案定制化能力强。' },
    { id: 'aks-3', name: '何文静', phone: '13899000073', department: '客户运营中心', position: '销售总监', tags: ['一对一服务', '高端权益讲解'], remark: '全球通高价值客户服务专业，权益覆盖率高。' },
  ],
  克州: [
    { id: 'kz-1', name: '施晓雯', phone: '13899000081', department: '存量运营中心', position: '运营经理', tags: ['外呼', '价格谈判'], remark: '外呼执行高效，谈判转化稳定。' },
    { id: 'kz-2', name: '张磊', phone: '13899000082', department: '产品运营中心', position: '营销经理', tags: ['装维随销', '融合套餐讲解'], remark: '装维随销能力强，融合产品推广积极。' },
  ],
  喀什: [
    { id: 'ks-1', name: '王芳', phone: '13899000091', department: '存量运营中心', position: '客服专员', tags: ['挽留话术', '投诉处理'], remark: '挽留话术熟练，客户沟通耐心，反馈良好。' },
    { id: 'ks-2', name: '李强', phone: '13899000092', department: '客户运营中心', position: '销售经理', tags: ['一对一服务', '高端权益讲解'], remark: '高价值客户专属服务细致，权益触达率高。' },
    { id: 'ks-3', name: '刘洋', phone: '13899000093', department: '产品运营中心', position: '市场专员', tags: ['外呼', '融合套餐讲解'], remark: '外呼勤奋，融合套餐讲解到位。' },
  ],
  和田: [
    { id: 'ht-1', name: '陈静', phone: '13899000101', department: '产品运营中心', position: '运营专员', tags: ['智家产品安装', '装维随销'], remark: '智家安装技能扎实，随销业绩良好。' },
    { id: 'ht-2', name: '周涛', phone: '13899000102', department: '客户运营中心', position: '销售专员', tags: ['外呼', '价格谈判'], remark: '外呼执行积极，谈判促成率高。' },
  ],
  伊犁: [
    { id: 'yl-1', name: '吴敏', phone: '13899000111', department: '客户运营中心', position: '运营经理', tags: ['一对一服务', '挽留话术'], remark: '高端客户维系服务专业，挽留话术运用娴熟。' },
    { id: 'yl-2', name: '郑浩', phone: '13899000112', department: '存量运营中心', position: '销售经理', tags: ['合约续约', '价格谈判'], remark: '合约续约谈判能力强，客户黏性维护好。' },
    { id: 'yl-3', name: '王丽', phone: '13899000113', department: '产品运营中心', position: '市场专员', tags: ['融合套餐讲解', '外呼'], remark: '家庭融合套餐讲解清晰，外呼执行认真。' },
  ],
  塔城: [
    { id: 'tc-1', name: '李娜', phone: '13899000121', department: '存量运营中心', position: '客服经理', tags: ['挽留话术', '投诉处理'], remark: '离网客户挽留耐心细致，投诉处理及时高效。' },
    { id: 'tc-2', name: '张伟', phone: '13899000122', department: '客户运营中心', position: '营销经理', tags: ['外呼', '高端权益讲解'], remark: '外呼转化稳定，高端权益讲解专业。' },
  ],
  阿勒泰: [
    { id: 'alt-1', name: '王磊', phone: '13899000131', department: '客户运营中心', position: '运营专员', tags: ['外呼', '讲解'], remark: '外呼执行勤奋，产品讲解清楚。' },
    { id: 'alt-2', name: '赵敏', phone: '13899000132', department: '存量运营中心', position: '销售专员', tags: ['价格谈判', '合约续约'], remark: '谈判促单能力强，续约执行稳定。' },
  ],
  奎屯: [
    { id: 'kt-1', name: '刘强', phone: '13899000141', department: '产品运营中心', position: '运营经理', tags: ['融合套餐讲解', '装维随销'], remark: '融合业务推广能力好，随销转化稳定。' },
    { id: 'kt-2', name: '孙丽', phone: '13899000142', department: '客户运营中心', position: '客服专员', tags: ['挽留话术', '一对一服务'], remark: '挽留与专属服务并重，客户评价高。' },
  ],
  石河子: [
    { id: 'shz-1', name: '周杰', phone: '13899000151', department: '存量运营中心', position: '销售经理', tags: ['外呼', '价格谈判'], remark: '外呼业绩稳定，价格谈判能力突出。' },
    { id: 'shz-2', name: '吴静', phone: '13899000152', department: '产品运营中心', position: '运营经理', tags: ['智家产品安装', '融合套餐讲解'], remark: '智家安装与融合推广综合能力强。' },
    { id: 'shz-3', name: '郑丽', phone: '13899000153', department: '客户运营中心', position: '营销经理', tags: ['高端权益讲解', '一对一服务'], remark: '全球通高价值客户服务专业，权益覆盖率高。' },
  ],
};
