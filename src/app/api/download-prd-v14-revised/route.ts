import { NextRequest, NextResponse } from "next/server";
import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from 'fs';

export async function GET() {
  try {
    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    // 读取修改后的文档
    const docPath = '/tmp/市场运营平台首页PRD_v14_修订版.docx';
    const docContent = readFileSync(docPath);

    // 上传文档
    const fileKey = await storage.uploadFile({
      fileContent: docContent,
      fileName: '市场运营平台首页PRD_v14_修订版.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // 生成下载链接（7天有效期）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800,
    });

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Download PRD error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download PRD document' },
      { status: 500 }
    );
  }
}
