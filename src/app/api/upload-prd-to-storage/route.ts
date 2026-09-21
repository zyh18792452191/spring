import { NextResponse } from 'next/server';
import fs from 'fs';

export async function POST() {
  try {
    const prdFilePath = '/tmp/prd_v26_fixed_numbers.docx';

    // 检查文件是否存在
    if (!fs.existsSync(prdFilePath)) {
      return NextResponse.json({ error: 'PRD文件不存在' }, { status: 404 });
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
      fileName: '市场运营平台首页PRD_v26_修复序号版.docx',
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
      fileName: '市场运营平台首页PRD_v24_最终修正版.docx',
      fileSize: fileBuffer.length,
      expiresIn: 604800, // 7天（秒）
      version: 'v26_修复序号版',
      notes: [
        '基于 v25 修复序号问题',
        '修复了77处序号不连续的问题',
        '所有序号现已连续（1、2、3、4...）',
        '修复的功能说明、交互说明、展示规则、约束规则等',
        '为21个空子章节添加了"无"字',
        '4.1 一级运营人员业务流程：8步，序号连续（1-8）',
        '4.2 省级运营人员业务流程：8步，序号连续（1-8）',
        '所有文字颜色统一为纯黑色',
        '字体和大小统一规范',
        '删除臆造功能（区域筛选器、时间筛选器、地市数据对比）',
        '保留实际功能（调度跟踪、效果跟踪）',
        'WPS 导航视图正常显示章节',
        '保留所有 7 张截图',
        '保留 9 个表格',
        '基于 src/app/page.tsx 门户首页代码',
        '文件名已支持中文'
      ]
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: '上传失败',
      message: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}
