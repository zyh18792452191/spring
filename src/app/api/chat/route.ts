import { NextRequest } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 对话消息类型
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 请求体类型
interface ChatRequest {
  messages: ChatMessage[];  // 完整的对话历史（包含上下文）
  model?: string;           // 可选指定模型
  temperature?: number;     // 可选温度参数
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model = 'glm-4-7-251222', temperature = 0.7 } = body;

    // 验证消息格式
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: '消息不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 初始化 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用 LLM 流式接口
          const llmStream = client.stream(messages, {
            model,
            temperature,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              // SSE 格式: data: {content}\n\n
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          // 发送结束标记
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          const errorMsg = error?.message || '生成失败';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
          controller.close();
        }
      },
    });

    // 返回 SSE 响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || '服务器错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
