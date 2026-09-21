import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取单个运营任务详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的任务 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('operational_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('获取运营任务详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取运营任务详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新运营任务
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的任务 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      taskName,
      startTime,
      endTime,
      actualEndTime,
      durationDays,
      province,
      formTemplateName,
      formData,
      status,
    } = body;

    const client = getSupabaseClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (taskName !== undefined) updateData.task_name = taskName;
    if (startTime !== undefined) {
      updateData.start_time = startTime;
      // 如果开始时间改变，重新计算时长
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      updateData.duration_days = durationDays || duration;
    }
    if (endTime !== undefined) {
      updateData.end_time = endTime;
      // 如果结束时间改变，重新计算时长
      const start = startTime ? new Date(startTime) : new Date();
      const end = new Date(endTime);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      updateData.duration_days = durationDays || duration;
    }
    if (durationDays !== undefined) updateData.duration_days = durationDays;
    if (province !== undefined) updateData.province = province;
    if (formTemplateName !== undefined) updateData.form_template_name = formTemplateName;
    if (formData !== undefined) updateData.form_data = JSON.stringify(formData);
    if (status !== undefined) {
      updateData.status = status;
      // 如果状态变为"已结束"且没有提供实际结束时间，自动使用结束时间
      if (status === 'finished' && actualEndTime === undefined && endTime !== undefined) {
        updateData.actual_end_time = endTime;
      }
    }
    if (actualEndTime !== undefined) updateData.actual_end_time = actualEndTime;

    const { data, error } = await client
      .from('operational_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('更新运营任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新运营任务失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除运营任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的任务 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 删除素材关联
    await client
      .from('material_associations')
      .delete()
      .eq('task_id', id);

    // 删除任务
    const { error } = await client
      .from('operational_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('删除运营任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除运营任务失败' },
      { status: 500 }
    );
  }
}
