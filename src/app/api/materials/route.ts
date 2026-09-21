import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取素材列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialName = searchParams.get('materialName');
    const materialType = searchParams.get('materialType');
    const businessType = searchParams.get('businessType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const client = getSupabaseClient();

    let query = client
      .from('materials')
      .select('*', { count: 'exact' });

    // 筛选条件
    if (materialName) {
      query = query.ilike('material_name', `%${materialName}%`);
    }
    if (materialType && materialType !== 'all') {
      query = query.eq('material_type', materialType);
    }
    if (businessType && businessType !== 'all') {
      query = query.eq('business_type', businessType);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error: any) {
    console.error('获取素材列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取素材列表失败' },
      { status: 500 }
    );
  }
}

// POST - 新增素材
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      materialName,
      materialType,
      businessType,
      visibility,
      fileKey,
      fileUrl,
      fileSize,
      fileMimeType,
      coverKey,
      coverUrl,
      copyrightInfo,
      copyrightStatement,
      copyrightProofKey,
      copyrightProofUrl,
      description,
      createdBy,
    } = body;

    // 验证必填字段
    if (!materialName || !materialType || !businessType || !visibility || !fileKey || !copyrightInfo || !copyrightStatement || !createdBy) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 生成素材编码
    const materialCode = `MAT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await client
      .from('materials')
      .insert({
        material_code: materialCode,
        material_name: materialName,
        material_type: materialType,
        business_type: businessType,
        visibility,
        file_key: fileKey,
        file_url: fileUrl,
        file_size: fileSize,
        file_mime_type: fileMimeType,
        cover_key: coverKey,
        cover_url: coverUrl,
        copyright_info: copyrightInfo,
        copyright_statement: copyrightStatement,
        copyright_proof_key: copyrightProofKey,
        copyright_proof_url: copyrightProofUrl,
        description,
        created_by: createdBy,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('新增素材失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '新增素材失败' },
      { status: 500 }
    );
  }
}
