import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取表单模板列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('form_templates')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('获取表单模板列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取表单模板列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建表单模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateCode,
      templateName,
      description,
      formConfig,
      createdBy,
    } = body;

    // 验证必填字段
    if (!templateCode || !templateName || !formConfig || !createdBy) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('form_templates')
      .insert({
        template_code: templateCode,
        template_name: templateName,
        description,
        form_config: JSON.stringify(formConfig),
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('创建表单模板失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建表单模板失败' },
      { status: 500 }
    );
  }
}
