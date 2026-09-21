import { NextResponse } from 'next/server';
import fs from 'fs';

export async function POST() {
  try {
    const prdFilePath = '/tmp/prd_v27_final.docx';

    // 检查文件是否存在
    if (!fs.existsSync(prdFilePath)) {
      return NextResponse.json({ error: 'PRD v27文件不存在' }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(prdFilePath);

    // 使用 SDK 上传到对象存储
    const { S3Storage } = await import('coze-coding-dev-sdk');

    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 上传文件
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: '市场运营平台首页PRD_v27_完整修复版.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    console.log('File uploaded successfully. Key:', fileKey);

    // 生成签名 URL（7天有效期）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 7 * 24 * 3600, // 7天
    });

    return NextResponse.json({
      success: true,
      fileKey,
      downloadUrl,
      fileName: '市场运营平台首页PRD_v27_完整修复版.docx',
      fileSize: fileBuffer.length,
      expiresIn: 604800, // 7天（秒）
      version: 'v27_完整修复版',
      notes: [
        '基于 v26 修复所有序号问题',
        '所有小节的序号都是连续的（从1开始）',
        '修复了检查脚本的逻辑错误',
        '每个独立小节都有自己的序号，不合并',
        '为21个空子章节添加了"无"字',
        '所有文字颜色为纯黑色（000000）',
        '字体和大小统一规范',
        '4.1 序号连续（1-8）',
        '4.2 序号连续（1-8）',
        'WPS 导航视图可以正常显示章节',
        '保留所有 7 张截图',
        '保留 9 个表格',
        '保留调度跟踪和效果跟踪模块',
        '删除臆造功能（区域筛选器、时间筛选器、地市数据对比）',
        '文件名支持中文',
        '文档内容与原型页面实际功能严格一致',
      ],
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '上传失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
