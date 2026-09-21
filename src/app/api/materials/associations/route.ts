import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// GET - 获取任务的关联素材
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少任务 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取关联的素材 ID 列表
    const { data: associations, error: assocError } = await client
      .from('material_associations')
      .select('material_id')
      .eq('task_id', taskId);

    if (assocError) throw assocError;

    if (!associations || associations.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const materialIds = associations.map(a => a.material_id);

    // 获取素材详情
    const { data: materials, error: materialError } = await client
      .from('materials')
      .select('*')
      .in('id', materialIds)
      .order('created_at', { ascending: false });

    if (materialError) throw materialError;

    // 重新生成签名 URL（避免 URL 过期）
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    const materialsWithUrls = await Promise.all(
      (materials || []).map(async (material: any) => {
        let fileUrl = material.file_url;
        let coverUrl = material.cover_url;

        try {
          if (material.file_key) {
            fileUrl = await storage.generatePresignedUrl({
              key: material.file_key,
              expireTime: 86400, // 24 小时
            });
          }
          if (material.cover_key) {
            coverUrl = await storage.generatePresignedUrl({
              key: material.cover_key,
              expireTime: 86400,
            });
          }
        } catch (urlError) {
          console.error('生成签名 URL 失败:', urlError);
        }

        return {
          ...material,
          file_url: fileUrl,
          cover_url: coverUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: materialsWithUrls,
      total: materialsWithUrls.length,
    });
  } catch (error: any) {
    console.error('获取关联素材失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取关联素材失败' },
      { status: 500 }
    );
  }
}

// POST - 关联素材到任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, materialIds } = body;

    if (!taskId || !materialIds || !Array.isArray(materialIds)) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 批量创建关联
    const associations = materialIds.map((materialId: number) => ({
      task_id: taskId,
      material_id: materialId,
    }));

    const { data, error } = await client
      .from('material_associations')
      .insert(associations)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('关联素材失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '关联素材失败' },
      { status: 500 }
    );
  }
}

// DELETE - 取消素材关联
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const materialId = searchParams.get('materialId');

    if (!taskId || !materialId) {
      return NextResponse.json(
        { success: false, error: '缺少任务 ID 或素材 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { error } = await client
      .from('material_associations')
      .delete()
      .eq('task_id', taskId)
      .eq('material_id', materialId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '取消关联成功',
    });
  } catch (error: any) {
    console.error('取消关联失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '取消关联失败' },
      { status: 500 }
    );
  }
}
