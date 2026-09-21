import { NextRequest, NextResponse } from 'next/server';
import { saveChangesToSource } from './utils';

interface EditChange {
  id: string;
  selector: string;
  type: 'style' | 'content' | 'attribute';
  property: string;
  value: string;
  oldValue: string;
  timestamp: number;
  elementId?: string;
  elementClass?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changes, pagePath } = body as { changes: EditChange[], pagePath: string };

    if (!changes || changes.length === 0) {
      return NextResponse.json(
        { error: '没有需要保存的修改' },
        { status: 400 }
      );
    }

    console.log(`开始保存 ${changes.length} 处修改到源文件...`);
    console.log('页面路径:', pagePath);

    // 保存修改到源文件
    const result = saveChangesToSource(changes, pagePath);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        savedChanges: changes.length,
        filePath: result.filePath,
        changes: changes,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('保存修改失败:', error);
    return NextResponse.json(
      { error: '保存修改失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
