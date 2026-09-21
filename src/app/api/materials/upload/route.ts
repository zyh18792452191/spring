import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

// POST - 上传文件到对象存储
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string || 'material'; // material, cover, copyright_proof

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = {
      material: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      cover: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      copyright_proof: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    };

    const allowedMimeTypes = allowedTypes[fileType as keyof typeof allowedTypes] || allowedTypes.material;

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      );
    }

    // 验证文件大小（10MB 限制）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    // 将文件转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 生成文件路径
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileType}s/${timestamp}_${randomStr}.${fileExtension}`;

    // 上传文件
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType: file.type,
    });

    // 生成签名 URL
    const fileUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400, // 24 小时
    });

    return NextResponse.json({
      success: true,
      data: {
        fileKey,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      },
    });
  } catch (error: any) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '文件上传失败' },
      { status: 500 }
    );
  }
}
