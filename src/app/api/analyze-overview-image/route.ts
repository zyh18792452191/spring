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
    const imagePath = path.join(process.cwd(), 'assets', '6910f31eb9ac66723a7bc5f8904d1e3f.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    const messages: Message[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请详细分析这个离网维系概览页面的布局和内容，包括：\n1. 页面整体布局结构（哪些区域、如何排列）\n2. 所有指标卡片的名称、数值、单位、环比数据\n3. 所有图表的类型（柱状图、折线图、混合图等）和展示内容\n4. 每个图表的数据结构和配置\n5. 颜色方案和配色\n6. Tab标签的名称和内容\n7. 所有可见的文本内容\n8. 按钮和交互元素\n请用结构化的方式详细描述，以便我能够使用React、Tailwind CSS和Recharts完整还原这个页面。',
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
