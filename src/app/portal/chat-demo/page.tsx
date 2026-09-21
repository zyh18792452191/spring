'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 可用模型
const AVAILABLE_MODELS = [
  { id: 'glm-4-7-251222', name: 'GLM-4-7' },
  { id: 'doubao-seed-2-0-pro-260215', name: '豆包 Seed 2.0 Pro' },
  { id: 'doubao-seed-1-8-251228', name: '豆包 Seed 1.8' },
  { id: 'deepseek-v3-2-251201', name: 'DeepSeek V3.2' },
  { id: 'kimi-k2-5-260127', name: 'Kimi K2.5' },
];

// 系统提示词
const SYSTEM_PROMPT = `你是一位专业的电信运营业务助手，擅长分析客户数据、解答业务问题。
请用简洁、专业的方式回答问题，必要时提供数据分析和建议。`;

export default function ChatDemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('glm-4-7-251222');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 创建 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      // 构建完整的对话历史（包含系统提示词）
      const conversationHistory = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage.content },
      ];

      // 调用流式 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          model: selectedModel,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      // 读取流式响应
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                // 更新 AI 消息内容
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId ? { ...m, content: fullContent } : m
                ));
              }
              if (data.done) {
                break;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      if (!fullContent) {
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, content: '抱歉，我无法生成回复。' } : m
        ));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, content: '抱歉，发生了错误，请稍后重试。' } : m
      ));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
  };

  // 处理回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">智能对话助手</h1>
            <p className="text-sm text-gray-500 mt-1">
              支持上下文记忆的多轮对话 · 当前模型：{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-2" />
              清空对话
            </Button>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* 欢迎消息 */}
            {messages.length === 0 && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-white border-blue-100">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    欢迎使用智能对话助手
                  </h2>
                  <p className="text-gray-600 mb-4">
                    我可以帮你分析电信运营数据、解答业务问题。
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      '本月离网客户数是多少？',
                      '分析一下中高端客户保有率',
                      '如何降低客户流失率？',
                    ].map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-gray-600"
                        onClick={() => {
                          setInput(example);
                          inputRef.current?.focus();
                        }}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 消息列表 */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>

                {/* 消息内容 */}
                <Card
                  className={`p-4 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content || (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        思考中...
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送)"
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          当前对话包含 {messages.filter(m => m.role === 'user').length} 轮上下文 · 
          切换模型或清空对话将重置上下文
        </p>
      </div>
    </div>
  );
}
