'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Sparkles,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  contextInfo?: string;
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: '你好！我是AI洞察助手，可以帮你生成分析报告、查询指标数据、解读异动原因。有什么可以帮你的？',
      timestamp: '刚刚',
      quickReplies: ['生成月度经营分析报告', '帮我分析ARPU下降原因', '查看本月关键指标'],
      contextInfo: '当前页面：首页',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: '刚刚',
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // 模拟AI回复
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: inputValue.includes('报告')
          ? '好的，我来帮你生成报告。请确认以下信息：\n\n报告类型：月度经营分析\n时间范围：2026年6月\n区域范围：全疆\n\n确认后我将在全屏编辑器中为你生成完整报告。'
          : inputValue.includes('ARPU') || inputValue.includes('下降')
          ? '已检测到ARPU相关分析请求。6月全疆ARPU环比下降3.2%，主要受低价值套餐用户占比上升影响。如需详细归因分析，建议生成完整报告。'
          : '收到，我来为你查询相关信息。请问你需要查看哪个时间范围和区域的数据？',
        timestamp: '刚刚',
        quickReplies: ['确认，开始生成报告', '调整报告范围', '查看ARPU归因详情'],
        contextInfo: inputValue.includes('报告') ? '匹配模板：月度经营分析报告' : undefined,
      };
      setMessages(prev => [...prev, reply]);
    }, 800);
  };

  const handleQuickReply = (text: string) => {
    setInputValue(text);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 z-50 w-[400px] bg-background border-l shadow-2xl flex flex-col">
      {/* 头部 */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI洞察助手</div>
            <div className="text-xs text-muted-foreground">在线</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/workspace/ai-insight">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 上下文信息 */}
      <div className="px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground shrink-0">
        <span className="font-medium">当前感知：</span>首页 / 全疆 / 日度指标
      </div>

      {/* 消息区 */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
              {msg.role === 'system' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">AI助手</span>
                </div>
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50'
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.contextInfo && (
                <div className="mt-1 text-xs text-muted-foreground/60 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />{msg.contextInfo}
                </div>
              )}
              {msg.quickReplies && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(qr)}
                      className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted/50 transition-colors"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground/40">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 border-t shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入消息..."
              className="h-8 text-sm pr-9"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-0.5 h-7 w-7 p-0"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-muted-foreground">快捷：</span>
          {['生成报告', '重点分析', '对比上月', '全疆排名'].map(cmd => (
            <button
              key={cmd}
              onClick={() => handleQuickReply(cmd)}
              className="text-xs px-2 py-0.5 rounded bg-muted/50 hover:bg-muted transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
