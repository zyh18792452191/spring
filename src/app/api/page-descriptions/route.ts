import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取页面说明
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: '缺少 path 参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('page_descriptions')
      .select('id, path, description, last_updated')
      .eq('path', path)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回空数据
        return NextResponse.json({
          success: true,
          data: null
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('获取页面说明失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取页面说明失败'
      },
      { status: 500 }
    );
  }
}

// POST - 保存或更新页面说明
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, description } = body;

    if (!path) {
      return NextResponse.json(
        { error: '缺少 path 参数' },
        { status: 400 }
      );
    }

    if (typeof description !== 'string') {
      return NextResponse.json(
        { error: 'description 必须是字符串' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查是否已存在该路径的说明
    const { data: existing } = await client
      .from('page_descriptions')
      .select('id')
      .eq('path', path)
      .single();

    let result;

    if (existing) {
      // 更新现有记录
      const { data, error } = await client
        .from('page_descriptions')
        .update({
          description: description,
          last_updated: new Date().toISOString()
        })
        .eq('path', path)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 插入新记录
      const { data, error } = await client
        .from('page_descriptions')
        .insert({
          path: path,
          description: description,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('保存页面说明失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '保存页面说明失败'
      },
      { status: 500 }
    );
  }
}
