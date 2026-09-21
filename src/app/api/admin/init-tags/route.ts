import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST - 初始化标签数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查是否已经初始化
    const { data: existingTags } = await client
      .from('tags')
      .select('id')
      .limit(1);

    if (existingTags && existingTags.length > 0) {
      return NextResponse.json({
        success: true,
        message: '标签数据已存在，无需重复初始化',
        data: existingTags
      });
    }

    // 插入一级标签
    const { data: level1Tags, error: level1Error } = await client
      .from('tags')
      .insert([
        { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', name: '存量运营', level: 1, parent_id: null, is_system: true, sort_order: 1, description: '存量运营相关标签' },
        { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef2', name: '国际业务运营', level: 1, parent_id: null, is_system: true, sort_order: 2, description: '国际业务运营相关标签' },
        { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef3', name: '家庭运营', level: 1, parent_id: null, is_system: true, sort_order: 3, description: '家庭运营相关标签' },
      ])
      .select();

    if (level1Error) {
      console.error('插入一级标签失败:', level1Error);
      // 可能表还不存在，返回错误信息
      return NextResponse.json({
        success: false,
        error: '标签表可能不存在，请先创建表',
        details: level1Error.message
      }, { status: 500 });
    }

    // 插入二级标签（存量运营下）
    const { data: level2Tags, error: level2Error } = await client
      .from('tags')
      .insert([
        { id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef1', name: '中高端客户运营', level: 2, parent_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', is_system: true, sort_order: 1, description: '中高端客户运营' },
        { id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef2', name: '离网维系', level: 2, parent_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', is_system: true, sort_order: 2, description: '离网维系' },
        { id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef3', name: '用量运营', level: 2, parent_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', is_system: true, sort_order: 3, description: '用量运营' },
        { id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef4', name: '融合运营', level: 2, parent_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', is_system: true, sort_order: 4, description: '融合运营' },
        { id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef5', name: '细分市场运营', level: 2, parent_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', is_system: true, sort_order: 5, description: '细分市场运营' },
      ])
      .select();

    if (level2Error) {
      console.error('插入二级标签失败:', level2Error);
      // 尝试删除已插入的一级标签
      await client.from('tags').delete().in('id', ['a1b2c3d4-e5f6-7890-1234-567890abcdef1', 'a1b2c3d4-e5f6-7890-1234-567890abcdef2', 'a1b2c3d4-e5f6-7890-1234-567890abcdef3']);
      return NextResponse.json({
        success: false,
        error: '插入二级标签失败',
        details: level2Error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '标签初始化成功',
      data: {
        level1Tags,
        level2Tags
      }
    });
  } catch (error: any) {
    console.error('初始化标签失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '初始化标签失败' },
      { status: 500 }
    );
  }
}
