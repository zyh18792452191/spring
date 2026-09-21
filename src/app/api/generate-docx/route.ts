import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, markdownContent, filename } = body;

    const mdContent = markdown || markdownContent;

    if (!mdContent) {
      return NextResponse.json(
        { success: false, error: 'Missing markdown content' },
        { status: 400 }
      );
    }

    // 调用修复后的 Python 脚本生成格式化的 DOCX
    const command = `python3 /tmp/generate_docx_v3.py '${mdContent.replace(/'/g, "\\'")}' '${filename || 'prd'}'`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json(
        { success: false, error: stderr },
        { status: 500 }
      );
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename
    });

  } catch (error) {
    console.error('Generate DOCX error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
