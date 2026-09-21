import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    const prdFilePath = '/tmp/prd_v1.0.docx';

    // 检查文件是否存在
    if (!fs.existsSync(prdFilePath)) {
      return NextResponse.json({ error: 'PRD文件不存在' }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(prdFilePath);

    // 返回文件
    const response = new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Length': fileBuffer.length.toString(),
      },
    });

    // 添加下载文件名
    response.headers.set(
      'Content-Disposition',
      'attachment; filename*=UTF-8\'\'%E5%B8%82%E5%9C%BA%E8%BF%90%E8%90%A5%E5%B9%B3%E5%8F%B0%E9%A6%96%E9%A1%B5PRD_v1.0.docx'
    );

    return response;
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({
      error: '下载失败',
      message: error.message
    }, { status: 500 });
  }
}
