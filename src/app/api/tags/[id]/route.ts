import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PUT - 更新标签
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, businessScenarios } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查标签是否存在
    const { data: existingTag } = await client
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingTag) {
      return NextResponse.json(
        { success: false, error: '标签不存在' },
        { status: 404 }
      );
    }

    // 对于系统标签，只允许更新业务场景，不允许修改名称和描述
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (existingTag.is_system) {
      // 系统标签：只能更新业务场景
      if (name && name.trim() !== existingTag.name) {
        return NextResponse.json(
          { success: false, error: '系统标签不允许修改名称和描述' },
          { status: 403 }
        );
      }
      if (description && description !== existingTag.description) {
        return NextResponse.json(
          { success: false, error: '系统标签不允许修改名称和描述' },
          { status: 403 }
        );
      }
      if (businessScenarios !== undefined) {
        // 系统标签可以更新业务场景
        updateData.business_scenarios = businessScenarios;
      }
    } else {
      // 非系统标签：可以更新名称、描述和业务场景
      updateData.name = name.trim() || existingTag.name;
      updateData.description = description !== undefined ? description.trim() : existingTag.description;
      if (businessScenarios !== undefined) {
        updateData.business_scenarios = businessScenarios;
      }
    }

    // 检查是否为一级标签（一级标签不允许关联业务场景）
    if (existingTag.level === 1 && updateData.business_scenarios && updateData.business_scenarios.length > 0) {
      return NextResponse.json(
        { success: false, error: '一级标签不允许关联业务场景' },
        { status: 400 }
      );
    }

    // 检查是否有子标签（有子标签的标签不允许关联业务场景）
    if (updateData.business_scenarios && updateData.business_scenarios.length > 0) {
      const { data: childTags } = await client
        .from('tags')
        .select('id')
        .eq('parent_id', id);

      if (childTags && childTags.length > 0) {
        return NextResponse.json(
          { success: false, error: '有子标签的标签不允许关联业务场景' },
          { status: 400 }
        );
      }
    }

    // 更新标签
    const { data: updatedTag, error } = await client
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新标签失败:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTag
    });
  } catch (error: any) {
    console.error('更新标签失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新标签失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除标签
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const client = getSupabaseClient();

    // 检查标签是否存在
    const { data: existingTag } = await client
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingTag) {
      return NextResponse.json(
        { success: false, error: '标签不存在' },
        { status: 404 }
      );
    }

    // 检查是否为系统标签（系统标签不允许删除）
    if (existingTag.is_system) {
      return NextResponse.json(
        { success: false, error: '系统标签不允许删除' },
        { status: 403 }
      );
    }

    // 检查是否有子标签（如果有子标签，不允许删除）
    const { data: childTags } = await client
      .from('tags')
      .select('id')
      .eq('parent_id', id);

    if (childTags && childTags.length > 0) {
      return NextResponse.json(
        { success: false, error: '该标签下有子标签，请先删除子标签' },
        { status: 400 }
      );
    }

    // 删除标签
    const { error } = await client
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除标签失败:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error: any) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除标签失败' },
      { status: 500 }
    );
  }
}
