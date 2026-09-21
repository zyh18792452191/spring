import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// GET - 获取单个素材详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的素材 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: '素材不存在' },
        { status: 404 }
      );
    }

    // 重新生成签名 URL（避免 URL 过期）
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    let fileUrl = data.file_url;
    let coverUrl = data.cover_url;
    let copyrightProofUrl = data.copyright_proof_url;

    try {
      if (data.file_key) {
        fileUrl = await storage.generatePresignedUrl({
          key: data.file_key,
          expireTime: 86400, // 24 小时
        });
      }
      if (data.cover_key) {
        coverUrl = await storage.generatePresignedUrl({
          key: data.cover_key,
          expireTime: 86400,
        });
      }
      if (data.copyright_proof_key) {
        copyrightProofUrl = await storage.generatePresignedUrl({
          key: data.copyright_proof_key,
          expireTime: 86400,
        });
      }
    } catch (urlError) {
      console.error('生成签名 URL 失败:', urlError);
      // 使用原始 URL 作为降级
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        file_url: fileUrl,
        cover_url: coverUrl,
        copyright_proof_url: copyrightProofUrl,
      },
    });
  } catch (error: any) {
    console.error('获取素材详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取素材详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新素材
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的素材 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      materialName,
      materialType,
      businessType,
      visibility,
      coverKey,
      coverUrl,
      copyrightInfo,
      copyrightStatement,
      copyrightProofKey,
      copyrightProofUrl,
      description,
    } = body;

    const client = getSupabaseClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (materialName !== undefined) updateData.material_name = materialName;
    if (materialType !== undefined) updateData.material_type = materialType;
    if (businessType !== undefined) updateData.business_type = businessType;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (coverKey !== undefined) updateData.cover_key = coverKey;
    if (coverUrl !== undefined) updateData.cover_url = coverUrl;
    if (copyrightInfo !== undefined) updateData.copyright_info = copyrightInfo;
    if (copyrightStatement !== undefined) updateData.copyright_statement = copyrightStatement;
    if (copyrightProofKey !== undefined) updateData.copyright_proof_key = copyrightProofKey;
    if (copyrightProofUrl !== undefined) updateData.copyright_proof_url = copyrightProofUrl;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await client
      .from('materials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: '素材不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('更新素材失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新素材失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除素材
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的素材 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 先获取素材信息，用于删除存储中的文件
    const { data: material, error: fetchError } = await client
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!material) {
      return NextResponse.json(
        { success: false, error: '素材不存在' },
        { status: 404 }
      );
    }

    // 删除素材关联
    await client
      .from('material_associations')
      .delete()
      .eq('material_id', id);

    // 删除素材
    const { error: deleteError } = await client
      .from('materials')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // 删除对象存储中的文件
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    try {
      if (material.file_key) {
        await storage.deleteFile({ fileKey: material.file_key });
      }
      if (material.cover_key) {
        await storage.deleteFile({ fileKey: material.cover_key });
      }
      if (material.copyright_proof_key) {
        await storage.deleteFile({ fileKey: material.copyright_proof_key });
      }
    } catch (storageError) {
      console.error('删除对象存储文件失败:', storageError);
      // 不阻止主流程，仅记录日志
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('删除素材失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除素材失败' },
      { status: 500 }
    );
  }
}
