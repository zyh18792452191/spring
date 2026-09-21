import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const filePath = '/tmp/prd_homepage_preview_content.txt';
    const content = await readFile(filePath, 'utf-8');

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Read PRD preview error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read PRD preview',
      },
      { status: 500 }
    );
  }
}
