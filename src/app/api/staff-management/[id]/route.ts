import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取人员详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('staff_management')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '人员不存在' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('获取人员详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取人员详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 修改人员
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const {
      name,
      region,
      department,
      position,
      phone,
      email,
      status,
      account4a,
      accountOa,
      accountProvincial,
      businessScenarios,
      tags,
      operator,
    } = body;

    // 验证必填字段
    if (!name || !region || !accountOa) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取原有数据用于对比
    const { data: oldData } = await client
      .from('staff_management')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!oldData) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      );
    }

    // 更新人员数据
    const { data, error } = await client
      .from('staff_management')
      .update({
        name,
        region,
        department: department || null,
        position: position || null,
        phone: phone || null,
        email: email || null,
        status,
        account_4a: account4a || null,
        account_oa: accountOa,
        account_provincial: accountProvincial,
        business_scenarios: businessScenarios || null,
        tags: tags || null,
        is_default_receiver: body.isDefaultReceiver,
        updated_by: operator || 'admin',
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // 记录变更日志 - 特别处理业务场景和标签
    const oldScenarios = oldData.business_scenarios || [];
    const newScenarios = businessScenarios || [];
    const oldTags = oldData.tags || [];
    const newTags = tags || [];

    // 检测业务场景的变化
    const addedScenarios = newScenarios.filter((s: string) => !oldScenarios.includes(s));
    const removedScenarios = oldScenarios.filter((s: string) => !newScenarios.includes(s));

    // 检测标签的变化
    const addedTags = newTags.filter((t: string) => !oldTags.includes(t));
    const removedTags = oldTags.filter((t: string) => !newTags.includes(t));

    // 只有业务场景或标签有变化时才记录日志
    if (addedScenarios.length > 0 || removedScenarios.length > 0) {
      const scenarioChanges = [];
      if (addedScenarios.length > 0) {
        scenarioChanges.push(`添加了业务场景${addedScenarios.join('、')}`);
      }
      if (removedScenarios.length > 0) {
        scenarioChanges.push(`移除了业务场景${removedScenarios.join('、')}`);
      }
      await client.from('staff_change_logs').insert({
        staff_id: data.id,
        employee_no: data.employee_no,
        region: data.region,
        operation_type: 'update',
        operation_content: `员工 ${data.name}信息更新：${scenarioChanges.join('，')}`,
        operator: operator || 'admin',
      });
    }

    if (addedTags.length > 0 || removedTags.length > 0) {
      const tagChanges = [];
      if (addedTags.length > 0) {
        tagChanges.push(`添加了标签${addedTags.join('、')}`);
      }
      if (removedTags.length > 0) {
        tagChanges.push(`移除了标签${removedTags.join('、')}`);
      }
      await client.from('staff_change_logs').insert({
        staff_id: data.id,
        employee_no: data.employee_no,
        region: data.region,
        operation_type: 'update',
        operation_content: `员工 ${data.name}信息更新：${tagChanges.join('，')}`,
        operator: operator || 'admin',
      });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '修改人员成功',
    });
  } catch (error: any) {
    console.error('修改人员失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '修改人员失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除人员
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const client = getSupabaseClient();

    // 获取人员信息
    const { data: staffData } = await client
      .from('staff_management')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!staffData) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      );
    }

    // 只有离职人员可以删除
    if (staffData.status !== 'inactive') {
      return NextResponse.json(
        { success: false, error: '只有离职人员可以删除' },
        { status: 400 }
      );
    }

    // 删除人员
    const { error } = await client
      .from('staff_management')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // 记录变更日志
    await client.from('staff_change_logs').insert({
      staff_id: staffData.id,
      employee_no: staffData.employee_no,
      region: staffData.region,
      operation_type: 'delete',
      operation_content: `删除人员：${staffData.name}（工号：${staffData.employee_no}，部门：${staffData.department || '无'}）`,
      operator: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: '删除人员成功',
    });
  } catch (error: any) {
    console.error('删除人员失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除人员失败' },
      { status: 500 }
    );
  }
}
