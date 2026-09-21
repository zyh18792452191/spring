import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Storage } from 'coze-coding-dev-sdk';

export async function POST() {
  try {
    const localFilePath = path.join(process.env.TMPDIR || '/tmp', '市场运营平台-调度总览-V29.docx');
    
    if (!fs.existsSync(localFilePath)) {
      return NextResponse.json({ error: 'PRD文件不存在' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(localFilePath);
    
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
    
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: 'prd/市场运营平台-调度总览-V29.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800,
    });
    
    return NextResponse.json({
      success: true,
      signedUrl,
      fileName: '市场运营平台-调度总览-V29.docx',
    });
  } catch (error) {
    console.error('上传PRD文件失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
