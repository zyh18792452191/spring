import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 业务场景数据（三级）
const BUSINESS_SCENARIOS = [
  '公众市场 / 客户运营 / 中高端客户运营',
  '公众市场 / 客户运营 / 离网维系',
  '公众市场 / 客户运营 / 国际业务运营',
  '公众市场 / 客户运营 / 家庭运营',
  '公众市场 / 客户运营 / 用量运营',
  '公众市场 / 客户运营 / 融合运营',
  '公众市场 / 客户运营 / 细分市场运营',
];

// 标签数据
const TAGS = [
  '存量运营人员',
  '国际业务运营人员',
  '家庭运营人员',
  '融合运营人员',
  '产品运营人员',
  '渠道运营人员',
  '终端运营人员',
  '权益运营人员',
  '积分运营人员',
];

// 随机选择1-3个业务场景
function getRandomScenarios(): string[] {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3个
  const shuffled = [...BUSINESS_SCENARIOS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 随机选择1-3个标签
function getRandomTags(): string[] {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3个
  const shuffled = [...TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// POST - 为现有人员随机分配业务场景和标签
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    console.log('开始为现有人员分配业务场景和标签...');

    // 获取所有人员
    const { data: staffList, error: fetchError } = await client
      .from('staff_management')
      .select('id, employee_no, name, region')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({
        success: true,
        message: '暂无人员数据需要处理',
      });
    }

    console.log(`找到 ${staffList.length} 名人员`);

    // 批量更新
    let successCount = 0;
    let failCount = 0;

    for (const staff of staffList) {
      const businessScenarios = getRandomScenarios();
      const tags = getRandomTags();

      const { error: updateError } = await client
        .from('staff_management')
        .update({
          business_scenarios: businessScenarios,
          tags: tags,
        })
        .eq('id', staff.id);

      if (updateError) {
        console.error(`更新人员 ${staff.employee_no} 失败:`, updateError);
        failCount++;
      } else {
        console.log(`更新人员 ${staff.employee_no} 成功: 业务场景=${businessScenarios.join(', ')}, 标签=${tags.join(', ')}`);
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `数据处理完成！成功 ${successCount} 条，失败 ${failCount} 条`,
      data: {
        total: staffList.length,
        success: successCount,
        fail: failCount,
      },
    });
  } catch (error: any) {
    console.error('处理失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '处理失败' },
      { status: 500 }
    );
  }
}
