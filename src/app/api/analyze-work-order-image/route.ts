import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const config = new Config();
    const client = new LLMClient(config);

    // 读取图片文件
    const imagePath = path.join(process.cwd(), 'assets', 'image.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    const messages: Message[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请详细分析这张图片中"工单分析"模块的设计和布局。请提供以下信息：

1. 整体布局结构（是否有Tab切换，有哪些Tab）
2. 每个Tab下的内容展示方式（卡片、表格、图表等）
3. 数据展示的具体格式（包括：数值、单位、标签、图标等）
4. 颜色方案和样式细节
5. 任何特殊的UI元素或交互设计
6. 如果有图表，请详细描述图表类型、数据展示方式

请用JSON格式返回结果，包含详细的UI组件结构描述，以便我能够完全一致地还原这个页面。`,
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
              detail: 'high',
            },
          },
        ] as ContentPart[],
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3,
    });

    return NextResponse.json({
      success: true,
      analysis: response.content,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image',
      },
      { status: 500 }
    );
  }
}
