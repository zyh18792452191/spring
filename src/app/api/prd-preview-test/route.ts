import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.env.TMPDIR || '/tmp', 'prd_prd_generator_test.docx');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'PRD文件不存在' }, { status: 404 });
    }
    
    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    
    // 返回文件
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="prd_prd_generator_test.docx"',
      },
    });
  } catch (error) {
    console.error('读取PRD文件失败:', error);
    return NextResponse.json({ error: '读取文件失败' }, { status: 500 });
  }
}
