import { CustomerTag, TagType } from '@/types/customerTag';

// 完整的客户标签清单
export const customerTags: CustomerTag[] = [
  // ========== 基本属性 ==========
  {
    id: 'tag_001',
    name: '是否离网客户',
    type: 'boolean',
    category: '基本属性',
    description: '客户是否已经离网'
  },
  {
    id: 'tag_002',
    name: '潜在离网客户打分',
    type: 'number',
    category: '基本属性',
    description: '潜在离网风险的评分'
  },
  {
    id: 'tag_003',
    name: '是否潜在离网客户',
    type: 'boolean',
    category: '基本属性',
    description: '根据模型判断是否为潜在离网客户'
  },
  {
    id: 'tag_004',
    name: '离网方式',
    type: 'enum',
    category: '基本属性',
    description: '客户离网的具体方式',
    options: ['主动销号', '欠费销号', '携出', '其他（冷冻期）']
  },
  {
    id: 'tag_005',
    name: '年龄',
    type: 'number',
    category: '基本属性',
    description: '客户年龄'
  },
  {
    id: 'tag_006',
    name: '网龄',
    type: 'number',
    category: '基本属性',
    description: '客户入网年限'
  },
  {
    id: 'tag_007',
    name: '性别',
    type: 'enum',
    category: '基本属性',
    description: '客户性别',
    options: ['男', '女']
  },
  {
    id: 'tag_008',
    name: '常驻地地州',
    type: 'enum',
    category: '基本属性',
    description: '客户常驻地的地州',
    options: ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子']
  },
  {
    id: 'tag_009',
    name: '成员属性',
    type: 'enum',
    category: '基本属性',
    description: '客户在家庭中的成员属性',
    options: ['户主', '配偶', '子女', '父母', '其他']
  },
  {
    id: 'tag_010',
    name: '职业',
    type: 'enum',
    category: '基本属性',
    description: '客户职业',
    options: ['公务员', '事业单位', '企业职工', '个体户', '自由职业', '学生', '退休人员', '无业', '其他']
  },

  // ========== 网络属性 ==========
  {
    id: 'tag_011',
    name: '品牌',
    type: 'enum',
    category: '网络属性',
    description: '客户使用的品牌',
    options: ['全球通', '动感地带', '神州行']
  },
  {
    id: 'tag_012',
    name: '入网月份',
    type: 'number',
    category: '网络属性',
    description: '客户入网的月份'
  },
  {
    id: 'tag_013',
    name: '入网渠道',
    type: 'enum',
    category: '网络属性',
    description: '客户入网的渠道',
    options: ['自营厅', '合作厅', '线上渠道', '社会渠道', '其他']
  },
  {
    id: 'tag_014',
    name: '手机网络种类使用时长分布占比',
    type: 'percentage',
    category: '网络属性',
    description: '不同网络类型的使用时长占比'
  },
  {
    id: 'tag_015',
    name: '终端类型',
    type: 'enum',
    category: '网络属性',
    description: '客户使用的终端类型',
    options: ['智能手机', '功能机', '数据卡', '其他']
  },
  {
    id: 'tag_016',
    name: '终端使用时长',
    type: 'number',
    category: '网络属性',
    description: '当前终端使用时长（月）'
  },
  {
    id: 'tag_017',
    name: '是否5G资费用户',
    type: 'boolean',
    category: '网络属性',
    description: '是否使用5G资费'
  },

  // ========== 套餐属性 ==========
  {
    id: 'tag_018',
    name: '套餐档次（T-3月）',
    type: 'enum',
    category: '套餐属性',
    description: 'T-3月的套餐档次',
    options: ['低档', '中档', '高档', '尊享档']
  },
  {
    id: 'tag_019',
    name: 'ARPU（T-6月）',
    type: 'number',
    category: '套餐属性',
    description: 'T-6月的ARPU值'
  },
  {
    id: 'tag_020',
    name: '当月arpu',
    type: 'number',
    category: '套餐属性',
    description: '当月ARPU值'
  },
  {
    id: 'tag_021',
    name: '当月arpu折扣比例',
    type: 'percentage',
    category: '套餐属性',
    description: '当月ARPU折扣比例'
  },
  {
    id: 'tag_022',
    name: '上月arpu值',
    type: 'number',
    category: '套餐属性',
    description: '上月ARPU值'
  },
  {
    id: 'tag_023',
    name: '上月折后arpu值',
    type: 'number',
    category: '套餐属性',
    description: '上月折后ARPU值'
  },
  {
    id: 'tag_024',
    name: '近三个月平均折后arpu',
    type: 'number',
    category: '套餐属性',
    description: '近三个月平均折后ARPU'
  },
  {
    id: 'tag_025',
    name: '近6个月平均折后arpu',
    type: 'number',
    category: '套餐属性',
    description: '近6个月平均折后ARPU'
  },
  {
    id: 'tag_026',
    name: '是否不限流量套餐用户',
    type: 'boolean',
    category: '套餐属性',
    description: '是否使用不限流量套餐'
  },
  {
    id: 'tag_027',
    name: '主套餐ID',
    type: 'string',
    category: '套餐属性',
    description: '主套餐的ID'
  },
  {
    id: 'tag_028',
    name: '主套餐档位（原价）',
    type: 'number',
    category: '套餐属性',
    description: '主套餐的原价档位'
  },
  {
    id: 'tag_029',
    name: '主套餐资费（实际支付价格）',
    type: 'number',
    category: '套餐属性',
    description: '主套餐实际支付价格'
  },
  {
    id: 'tag_030',
    name: '主套餐套内国内通用流量',
    type: 'number',
    category: '套餐属性',
    description: '主套餐套内国内通用流量（GB）'
  },
  {
    id: 'tag_031',
    name: '主套餐套内区域流量',
    type: 'number',
    category: '套餐属性',
    description: '主套餐套内区域流量（GB）'
  },
  {
    id: 'tag_032',
    name: '主套餐套内定向流量',
    type: 'number',
    category: '套餐属性',
    description: '主套餐套内定向流量（GB）'
  },
  {
    id: 'tag_033',
    name: '主套餐套内语音时长',
    type: 'number',
    category: '套餐属性',
    description: '主套餐套内语音时长（分钟）'
  },
  {
    id: 'tag_034',
    name: '近三月降档情况',
    type: 'number',
    category: '套餐属性',
    description: '近三个月降档次数'
  },
  {
    id: 'tag_035',
    name: '近三月升档情况',
    type: 'number',
    category: '套餐属性',
    description: '近三个月升档次数'
  },
  {
    id: 'tag_036',
    name: '半年内最近一次办理升档主套餐产品距今月份',
    type: 'number',
    category: '套餐属性',
    description: '最近一次升档距今月份数'
  },
  {
    id: 'tag_037',
    name: '是否是降档客户',
    type: 'boolean',
    category: '套餐属性',
    description: '是否为降档客户'
  },

  // ========== 流量属性 ==========
  {
    id: 'tag_038',
    name: 'DOU（T-6月）',
    type: 'number',
    category: '流量属性',
    description: 'T-6月的数据使用量（MB）'
  },
  {
    id: 'tag_039',
    name: '流量饱和度（T-3月）',
    type: 'percentage',
    category: '流量属性',
    description: 'T-3月的流量饱和度'
  },
  {
    id: 'tag_040',
    name: '超套额度（T-3月）',
    type: 'number',
    category: '流量属性',
    description: 'T-3月的超套额度（MB）'
  },
  {
    id: 'tag_041',
    name: '超套次数（T-3月）',
    type: 'number',
    category: '流量属性',
    description: 'T-3月的超套次数'
  },
  {
    id: 'tag_042',
    name: '流量单价（T-1月）',
    type: 'number',
    category: '流量属性',
    description: 'T-1月的流量单价（元/GB）'
  },
  {
    id: 'tag_043',
    name: '是否流量语音双低',
    type: 'boolean',
    category: '流量属性',
    description: '是否流量和语音使用量都低'
  },
  {
    id: 'tag_044',
    name: '是否流量语音双降',
    type: 'boolean',
    category: '流量属性',
    description: '是否流量和语音使用量都在下降'
  },
  {
    id: 'tag_045',
    name: '可用通用流量总额度',
    type: 'number',
    category: '流量属性',
    description: '当前可用通用流量总额度（GB）'
  },
  {
    id: 'tag_046',
    name: '可用定向流量总额度',
    type: 'number',
    category: '流量属性',
    description: '当前可用定向流量总额度（GB）'
  },
  {
    id: 'tag_047',
    name: '近三月平均超套流量（月）',
    type: 'number',
    category: '流量属性',
    description: '近三月平均超套流量（MB/月）'
  },
  {
    id: 'tag_048',
    name: '近三月平均超套流量费用（月）',
    type: 'number',
    category: '流量属性',
    description: '近三月平均超套流量费用（元/月）'
  },
  {
    id: 'tag_049',
    name: '近三月平均流量饱和度',
    type: 'percentage',
    category: '流量属性',
    description: '近三月平均流量饱和度'
  },
  {
    id: 'tag_050',
    name: '近三月出现流量抑制次数',
    type: 'number',
    category: '流量属性',
    description: '近三月出现流量抑制的次数'
  },
  {
    id: 'tag_051',
    name: '近3月平均使用流量（DOU）',
    type: 'number',
    category: '流量属性',
    description: '近3月平均使用流量（MB）'
  },
  {
    id: 'tag_052',
    name: '当月超套流量费用',
    type: 'number',
    category: '流量属性',
    description: '当月超套流量费用（元）'
  },
  {
    id: 'tag_053',
    name: '当月使用流量(当月DOU)',
    type: 'number',
    category: '流量属性',
    description: '当月使用流量（MB）'
  },
  {
    id: 'tag_054',
    name: '当月流量饱和度',
    type: 'percentage',
    category: '流量属性',
    description: '当月流量饱和度'
  },
  {
    id: 'tag_055',
    name: '当月流量超套天数',
    type: 'number',
    category: '流量属性',
    description: '当月流量超套天数'
  },
  {
    id: 'tag_056',
    name: '本月是否达到限速',
    type: 'boolean',
    category: '流量属性',
    description: '本月是否达到限速阈值'
  },
  {
    id: 'tag_057',
    name: '当月访问一级app流量专区次数',
    type: 'number',
    category: '流量属性',
    description: '当月访问流量专区次数'
  },
  {
    id: 'tag_058',
    name: '当前可用流量',
    type: 'number',
    category: '流量属性',
    description: '当前可用流量（GB）'
  },
  {
    id: 'tag_059',
    name: '流量包资费金额',
    type: 'number',
    category: '流量属性',
    description: '流量包资费金额（元）'
  },
  {
    id: 'tag_060',
    name: '最近1年办理过定向流量包次数',
    type: 'number',
    category: '流量属性',
    description: '最近1年办理定向流量包次数'
  },
  {
    id: 'tag_061',
    name: '最近1年办理过通用流量包次数',
    type: 'number',
    category: '流量属性',
    description: '最近1年办理通用流量包次数'
  },

  // ========== 语音属性 ==========
  {
    id: 'tag_062',
    name: 'MOU（T-6月）',
    type: 'number',
    category: '语音属性',
    description: 'T-6月的语音使用时长（分钟）'
  },
  {
    id: 'tag_063',
    name: '可用语音时长',
    type: 'number',
    category: '语音属性',
    description: '当前可用语音时长（分钟）'
  },
  {
    id: 'tag_064',
    name: '近三月平均超套语音时长（月）',
    type: 'number',
    category: '语音属性',
    description: '近三月平均超套语音时长（分钟/月）'
  },
  {
    id: 'tag_065',
    name: '近三月平均超套语音费用（月）',
    type: 'number',
    category: '语音属性',
    description: '近三月平均超套语音费用（元/月）'
  },
  {
    id: 'tag_066',
    name: '近3个月平均语音饱和度',
    type: 'percentage',
    category: '语音属性',
    description: '近3个月平均语音饱和度'
  },
  {
    id: 'tag_067',
    name: '近6个月语音超套次数',
    type: 'number',
    category: '语音属性',
    description: '近6个月语音超套次数'
  },
  {
    id: 'tag_068',
    name: '当月超套语音时长',
    type: 'number',
    category: '语音属性',
    description: '当月超套语音时长（分钟）'
  },
  {
    id: 'tag_069',
    name: '当月语音超套费用',
    type: 'number',
    category: '语音属性',
    description: '当月语音超套费用（元）'
  },
  {
    id: 'tag_070',
    name: '当月语音饱和度',
    type: 'percentage',
    category: '语音属性',
    description: '当月语音饱和度'
  },
  {
    id: 'tag_071',
    name: '当前是否语音抑制状态',
    type: 'boolean',
    category: '语音属性',
    description: '当前是否处于语音抑制状态'
  },
  {
    id: 'tag_072',
    name: '近三月出现语音抑制次数',
    type: 'number',
    category: '语音属性',
    description: '近三月出现语音抑制次数'
  },
  {
    id: 'tag_073',
    name: '最近1年办理过国际语音包次数',
    type: 'number',
    category: '语音属性',
    description: '最近1年办理国际语音包次数'
  },
  {
    id: 'tag_074',
    name: '最近1年办理过国内语音包次数',
    type: 'number',
    category: '语音属性',
    description: '最近1年办理国内语音包次数'
  },

  // ========== 行为属性 ==========
  {
    id: 'tag_075',
    name: '手机是否安装运营商官方一级APP',
    type: 'boolean',
    category: '行为属性',
    description: '是否安装运营商官方APP'
  },
  {
    id: 'tag_076',
    name: '用户7日内查询语音产品次数',
    type: 'number',
    category: '行为属性',
    description: '近7日查询语音产品次数'
  },
  {
    id: 'tag_077',
    name: '用户7日内是否浏览过积分商城次数',
    type: 'number',
    category: '行为属性',
    description: '近7日浏览积分商城次数'
  },
  {
    id: 'tag_078',
    name: '用户7日内查询流量产品次数',
    type: 'number',
    category: '行为属性',
    description: '近7日查询流量产品次数'
  },
  {
    id: 'tag_079',
    name: '用户7日内查询宽带产品次数',
    type: 'number',
    category: '行为属性',
    description: '近7日查询宽带产品次数'
  },
  {
    id: 'tag_080',
    name: '过去6个月外呼渠道营销触达率',
    type: 'percentage',
    category: '行为属性',
    description: '近6个月外呼营销触达率'
  },
  {
    id: 'tag_081',
    name: '近3个月外呼被触达次数',
    type: 'number',
    category: '行为属性',
    description: '近3个月外呼被触达次数'
  },
  {
    id: 'tag_082',
    name: '用户近一年申请发票次数',
    type: 'number',
    category: '行为属性',
    description: '近一年申请发票次数'
  },
  {
    id: 'tag_083',
    name: '近7天内营销过的产品ID以及营销结果',
    type: 'string',
    category: '行为属性',
    description: '近7天营销产品及结果'
  },
  {
    id: 'tag_084',
    name: '最近30天iptv使用次数',
    type: 'number',
    category: '行为属性',
    description: '近30天IPTV使用次数'
  },
  {
    id: 'tag_085',
    name: '最近30天iptv使用天数',
    type: 'number',
    category: '行为属性',
    description: '近30天IPTV使用天数'
  },
  {
    id: 'tag_086',
    name: '是否办理iptv会员',
    type: 'boolean',
    category: '行为属性',
    description: '是否办理IPTV会员'
  },

  // ========== 账务属性 ==========
  {
    id: 'tag_087',
    name: '半年内月均缴费次数',
    type: 'number',
    category: '账务属性',
    description: '半年内月均缴费次数'
  },
  {
    id: 'tag_088',
    name: '半年内次均缴费金额',
    type: 'number',
    category: '账务属性',
    description: '半年内次均缴费金额'
  },
  {
    id: 'tag_089',
    name: '手机账户余额',
    type: 'number',
    category: '账务属性',
    description: '手机账户余额（元）'
  },

  // ========== 产品属性 ==========
  {
    id: 'tag_090',
    name: '用户当月失效产品清单',
    type: 'string',
    category: '产品属性',
    description: '当月失效产品清单'
  },
  {
    id: 'tag_091',
    name: '用户下月失效产品清单',
    type: 'string',
    category: '产品属性',
    description: '下月失效产品清单'
  },
  {
    id: 'tag_092',
    name: '最近1年办理二级产品标签偏好',
    type: 'string',
    category: '产品偏好',
    description: '最近1年二级产品标签偏好'
  },
  {
    id: 'tag_093',
    name: '最近1年领取过的权益类型偏好',
    type: 'string',
    category: '产品偏好',
    description: '最近1年权益类型偏好'
  },
  {
    id: 'tag_094',
    name: '最近1年领取过的权益偏好',
    type: 'string',
    category: '产品偏好',
    description: '最近1年权益偏好'
  },
  {
    id: 'tag_095',
    name: '最近1年办理产品的归属业务线条偏好',
    type: 'string',
    category: '产品偏好',
    description: '最近1年业务线条偏好'
  },
  {
    id: 'tag_096',
    name: '最近1年办理过的产品ID偏好',
    type: 'string',
    category: '产品偏好',
    description: '最近1年产品ID偏好'
  },
  {
    id: 'tag_097',
    name: '用户在用产品信息',
    type: 'string',
    category: '产品属性',
    description: '在用产品信息'
  },

  // ========== 其他属性 ==========
  {
    id: 'tag_098',
    name: '宽带办理情况',
    type: 'enum',
    category: '宽带属性',
    description: '宽带办理情况',
    options: ['已办理', '未办理', '办理中']
  },
  {
    id: 'tag_099',
    name: '是否宽带沉默',
    type: 'boolean',
    category: '宽带属性',
    description: '宽带是否沉默（低使用量）'
  },
  {
    id: 'tag_100',
    name: '宽带到期剩余月份',
    type: 'number',
    category: '宽带属性',
    description: '宽带到期剩余月份数'
  },
  {
    id: 'tag_101',
    name: '是否有效融合',
    type: 'boolean',
    category: '融合属性',
    description: '是否为有效融合用户'
  },
  {
    id: 'tag_102',
    name: '是否五类合约',
    type: 'boolean',
    category: '合约属性',
    description: '是否为五类合约用户'
  },
  {
    id: 'tag_103',
    name: '是否裸奔',
    type: 'boolean',
    category: '合约属性',
    description: '是否裸奔（无合约）'
  },
  {
    id: 'tag_104',
    name: '是否合约T-3月内到期',
    type: 'boolean',
    category: '合约属性',
    description: '合约是否在T-3月内到期'
  },
  {
    id: 'tag_105',
    name: '是否亲情网',
    type: 'boolean',
    category: '社群属性',
    description: '是否加入亲情网'
  },
  {
    id: 'tag_106',
    name: '是否集团V网',
    type: 'boolean',
    category: '社群属性',
    description: '是否加入集团V网'
  },
  {
    id: 'tag_107',
    name: '是否集团统付',
    type: 'boolean',
    category: '社群属性',
    description: '是否集团统付'
  },
  {
    id: 'tag_108',
    name: '代付状态',
    type: 'enum',
    category: '账户属性',
    description: '代付状态',
    options: ['已开通', '未开通']
  },
  {
    id: 'tag_109',
    name: '共享状态',
    type: 'enum',
    category: '账户属性',
    description: '共享状态',
    options: ['主卡', '副卡', '无共享']
  },
  {
    id: 'tag_110',
    name: '卡槽属性',
    type: 'enum',
    category: '账户属性',
    description: '卡槽属性',
    options: ['主卡', '副卡']
  },
  {
    id: 'tag_111',
    name: '离网去向',
    type: 'enum',
    category: '离网属性',
    description: '离网后去向',
    options: ['转网', '销号', '其他']
  },
  {
    id: 'tag_112',
    name: '是否校园用户',
    type: 'boolean',
    category: '用户特征',
    description: '是否为校园用户'
  },
  {
    id: 'tag_113',
    name: '是否副卡',
    type: 'boolean',
    category: '用户特征',
    description: '是否为副卡'
  },
  {
    id: 'tag_114',
    name: '是否低消用户',
    type: 'boolean',
    category: '用户特征',
    description: '是否为低消费用户'
  },
  {
    id: 'tag_115',
    name: '是否融合用户',
    type: 'boolean',
    category: '用户特征',
    description: '是否为融合用户'
  },
  {
    id: 'tag_116',
    name: '是否日租卡用户',
    type: 'boolean',
    category: '用户特征',
    description: '是否为日租卡用户'
  },
  {
    id: 'tag_117',
    name: '存量用户星级',
    type: 'enum',
    category: '用户特征',
    description: '存量用户星级',
    options: ['一星', '二星', '三星', '四星', '五星', '金牌', '钻石', '皇冠']
  },
  {
    id: 'tag_118',
    name: '是否有车用户',
    type: 'boolean',
    category: '用户特征',
    description: '是否有车用户'
  },
  {
    id: 'tag_119',
    name: '当月是否为三无用户',
    type: 'boolean',
    category: '用户特征',
    description: '当月是否为三无用户（无流量、语音、短信使用）'
  },
  {
    id: 'tag_120',
    name: '上月是否为三无用户',
    type: 'boolean',
    category: '用户特征',
    description: '上月是否为三无用户'
  },
  {
    id: 'tag_121',
    name: '是否实名',
    type: 'boolean',
    category: '用户特征',
    description: '是否实名认证'
  },
];

// 获取所有标签分类
export function getTagCategories(): string[] {
  const categories = new Set(customerTags.map(tag => tag.category));
  return Array.from(categories).sort();
}

// 根据分类获取标签
export function getTagsByCategory(category: string): CustomerTag[] {
  return customerTags.filter(tag => tag.category === category);
}

// 搜索标签
export function searchTags(keyword: string): CustomerTag[] {
  if (!keyword) return customerTags;
  const lowerKeyword = keyword.toLowerCase();
  return customerTags.filter(tag =>
    tag.name.toLowerCase().includes(lowerKeyword) ||
    tag.id.toLowerCase().includes(lowerKeyword)
  );
}

// 根据ID获取标签
export function getTagById(id: string): CustomerTag | undefined {
  return customerTags.find(tag => tag.id === id);
}
