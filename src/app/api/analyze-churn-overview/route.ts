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
    const imagePath = path.join(process.cwd(), 'assets', 'c886a34695015c00648c64c2d6aac91c.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    const messages: Message[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请详细分析这个离网维系概览页面的布局和内容，包括：\n1. 页面整体布局结构\n2. 所有的指标卡片（名称、数值、环比数据、预警状态）\n3. 图表类型和展示内容\n4. 页面的颜色方案和配色\n5. 所有可见的文本内容\n6. 按钮和交互元素\n7. tab标签的名称和内容\n8. 左侧面板的功能模块\n请用结构化的方式描述，以便我能够使用React和Tailwind CSS还原这个页面。',
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

    const response = await client.invoke(
      messages,
      {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.7,
      }
    );

    return NextResponse.json({ success: true, content: response.content });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
