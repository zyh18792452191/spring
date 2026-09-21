import { NextRequest, NextResponse } from "next/server";
import { S3Storage } from "coze-coding-dev-sdk";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    // 生成Word文档（纯文本格式）
    const wordContent = content.replace(/\n/g, '\r\n');
    const buffer = Buffer.from(wordContent, 'utf-8');

    // 使用UUID作为文件名，避免中文导致签名问题
    const uuid = uuidv4();
    const fileName = `market_homepage_prd_${uuid}.docx`;

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // 生成签名URL（有效期7天）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天
    });

    return NextResponse.json({
      success: true,
      downloadUrl,
      filename: fileName,
      fileKey,
    });

  } catch (error) {
    console.error('Generate PRD Word error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PRD Word document' },
      { status: 500 }
    );
  }
}
