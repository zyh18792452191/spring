import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PATCH - 设置/取消默认接收人（非互斥模式，允许多个默认接收人）
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const client = getSupabaseClient();

    // 获取当前人员信息
    const { data: currentStaff } = await client
      .from('staff_management')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!currentStaff) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      );
    }

    const newStatus = !currentStaff.is_default_receiver;

    // 更新当前人员的默认接收人状态（不取消其他人员的默认状态）
    const { data, error } = await client
      .from('staff_management')
      .update({ is_default_receiver: newStatus })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: newStatus ? '设置默认接收人成功' : '取消默认接收人成功',
    });
  } catch (error: any) {
    console.error('设置默认接收人失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '设置默认接收人失败' },
      { status: 500 }
    );
  }
}
