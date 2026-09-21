import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少文件路径参数',
        },
        { status: 400 }
      );
    }

    // 安全检查：只允许读取 /tmp 目录下的文件
    if (!filePath.startsWith('/tmp/') || filePath.includes('..')) {
      return NextResponse.json(
        {
          success: false,
          message: '无效的文件路径',
        },
        { status: 400 }
      );
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({
        success: true,
        content,
        filePath,
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: `文件不存在: ${filePath}`,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Read knowledge file error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '读取文件失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
