import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 业务场景列表
const BUSINESS_SCENARIOS = [
  '中高端客户运营',
  '离网维系',
  '国际业务运营',
  '家庭运营',
  '用量运营',
  '融合运营',
  '细分市场运营',
] as const;

export type BusinessScenario = typeof BUSINESS_SCENARIOS[number];

// GET - 获取所有标签（树形结构）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取所有标签
    const { data: tags, error } = await client
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取标签失败:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!tags) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 构建树形结构
    const tagMap = new Map();
    const rootTags: any[] = [];

    // 先将所有标签放入 Map
    tags.forEach((tag: any) => {
      tagMap.set(tag.id, {
        ...tag,
        children: []
      });
    });

    // 构建父子关系
    tags.forEach((tag: any) => {
      const tagNode = tagMap.get(tag.id);
      if (tag.parent_id && tagMap.has(tag.parent_id)) {
        const parentNode = tagMap.get(tag.parent_id);
        parentNode.children.push(tagNode);
      } else {
        rootTags.push(tagNode);
      }
    });

    return NextResponse.json({
      success: true,
      data: rootTags,
      businessScenarios: BUSINESS_SCENARIOS
    });
  } catch (error: any) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取标签失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId, isSystem = false, sortOrder = 999, description = '', businessScenarios = [] } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 确定层级
    let level = 1;
    if (parentId) {
      const { data: parentTag } = await client
        .from('tags')
        .select('level')
        .eq('id', parentId)
        .single();

      if (parentTag) {
        level = (parentTag.level || 0) + 1;
      }
    }

    // 插入标签
    const { data: newTag, error } = await client
      .from('tags')
      .insert({
        id: crypto.randomUUID(),
        name: name.trim(),
        level,
        parent_id: parentId || null,
        is_system: isSystem,
        sort_order: sortOrder,
        description,
        business_scenarios: businessScenarios,
      })
      .select()
      .single();

    if (error) {
      console.error('创建标签失败:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newTag
    });
  } catch (error: any) {
    console.error('创建标签失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建标签失败' },
      { status: 500 }
    );
  }
}
