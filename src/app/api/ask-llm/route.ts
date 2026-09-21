import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Message } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: '缺少prompt参数' }, { status: 400 });
    }

    const client = new LLMClient({} as any);

    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的电信运营分析助手，请用简洁专业的语言回答问题。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await client.invoke(messages);

    return NextResponse.json({ result: response.content });
  } catch (error) {
    console.error('LLM请求失败:', error);
    return NextResponse.json({ error: '请求失败' }, { status: 500 });
  }
}
