import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const ALL_CITIES = [
  { name: '乌鲁木齐', code: 'WLMQ', baseCount: 250 },
  { name: '克拉玛依', code: 'KLYM', baseCount: 180 },
  { name: '吐鲁番', code: 'TLF', baseCount: 120 },
  { name: '哈密', code: 'HM', baseCount: 110 },
  { name: '昌吉', code: 'CJ', baseCount: 150 },
  { name: '博州', code: 'BET', baseCount: 80 },
  { name: '巴州', code: 'BYG', baseCount: 140 },
  { name: '阿克苏', code: 'AKS', baseCount: 130 },
  { name: '克州', code: 'KZ', baseCount: 70 },
  { name: '喀什', code: 'KS', baseCount: 150 },
  { name: '和田', code: 'HT', baseCount: 100 },
  { name: '伊犁', code: 'YL', baseCount: 140 },
  { name: '塔城', code: 'TC', baseCount: 100 },
  { name: '阿勒泰', code: 'ALT', baseCount: 80 },
  { name: '石河子', code: 'SHZ', baseCount: 90 },

];

const DEPARTMENTS = [
  '存量运营中心',
  '客户运营中心',
  '融合运营中心',
  '客户（品牌）运营中心',
  '集中客户关系运营专班',
  '客户价值运营指挥调度中心',
  '公众市场运营中心',
  '省存量运营团队',
  '产品客户运营中心',
  '融合及存量运营中心'
];

const POSITIONS = [
  '客户经理', '政企客户经理', '网络经理', '网格经理',
  '业务支撑经理', '渠道经理', '终端经理', '数据中心工程师',
  '网络运维工程师', '客户服务经理', '部门经理', '业务主管'
];

const SURNAMES = '王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎葛薛庞邹苏汤冯潘葛于时祁刘傅姜孔武庞吕曾朱孔许石崔汤曾邹孔曾朱孔许石崔汤曾邹';

const NAMES_MALE = '伟刚勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘';

const NAMES_FEMALE = '秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊兰凤洁梅琳素云莲真环雪荣爱妹霞香月莺媛艳瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽';

function generateRandomData(count: number, regionName: string, regionCode: string) {
  const result = [];

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.48;
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const name = surname + (isMale ?
      NAMES_MALE[Math.floor(Math.random() * NAMES_MALE.length)] :
      NAMES_FEMALE[Math.floor(Math.random() * NAMES_FEMALE.length)]);

    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const employeeNo = `${regionCode}${randomNum.toString().padStart(4, '0')}`;

    const phonePrefix = ['138', '139', '136', '137', '135', '158', '159'][Math.floor(Math.random() * 7)];
    const phoneSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

    const status = Math.random() < 0.92 ? 'active' : 'inactive';

    result.push({
      employee_no: employeeNo,
      name: name,
      region: regionName,
      department: department,
      position: position,
      phone: `${phonePrefix}${phoneSuffix}`,
      email: `${name.toLowerCase()}@139.com`,
      status: status,
      account_4a: Math.random() < 0.8 ? name : null,
      account_oa: `${name.toLowerCase()}_oa`,
      account_provincial: `${regionCode.toLowerCase()}_${name.toLowerCase()}`,
      created_by: 'system',
      updated_by: 'system',
    });
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 先清空现有数据
    await client.from('staff_management').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let totalInserted = 0;

    for (const province of ALL_CITIES) {
      // 根据省份生成不同数量的人员，确保至少100人
      const variance = Math.floor(Math.random() * 50) - 25; // ±25人波动
      const count = Math.max(100, province.baseCount + variance);

      const data = generateRandomData(count, province.name, province.code);

      // 批量插入，分批处理
      const batchSize = 50;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        try {
          const { error } = await client.from('staff_management').insert(batch);
          if (error) {
            console.error(`批量插入失败:`, error);
          } else {
            totalInserted += batch.length;
          }
        } catch (e) {
          console.error(`插入异常:`, e);
        }
      }

      console.log(`已生成 ${province.name}: ${count} 条`);
    }

    return NextResponse.json({
      success: true,
      message: `成功生成 ${totalInserted} 条测试数据`,
      data: {
        total: totalInserted,
        cities: ALL_CITIES.length,
      },
    });
  } catch (error: any) {
    console.error('生成测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '生成测试数据失败' },
      { status: 500 }
    );
  }
}
