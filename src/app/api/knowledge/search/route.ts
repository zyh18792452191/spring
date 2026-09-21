import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeClient, Config } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '5');
    const dataset = searchParams.get('dataset');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少查询参数',
        },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new KnowledgeClient(config);

    // 如果指定了数据集，则搜索指定数据集；否则搜索所有数据集
    const tableNames = dataset ? [dataset] : undefined;

    const response = await client.search(
      query,
      tableNames,
      topK
    );

    if (response.code === 0) {
      return NextResponse.json({
        success: true,
        query,
        dataset,
        count: response.chunks.length,
        results: response.chunks.map((chunk) => ({
          content: chunk.content,
          score: chunk.score,
          docId: (chunk as any).doc_id,
        })),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `搜索失败: ${response.msg}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '搜索失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
