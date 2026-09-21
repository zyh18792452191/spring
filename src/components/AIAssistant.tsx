'use client';

import { useState } from 'react';
import {
  X,
  Activity,
  Search,
  FileBarChart,
  Stethoscope,
  CalendarClock,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 6大AI赋能场景 - 点击跳转对应页面
const AI_CAPABILITIES = [
  {
    id: 'monitor',
    title: 'AI 指标监控预警',
    description: '实时监控核心指标，智能识别异常波动并主动预警',
    icon: Activity,
    color: '#0085D0',
    bgLight: '#E5F1F8',
    href: '/workspace/ai-insight?focus=monitor',
  },
  {
    id: 'root-cause',
    title: 'AI 根因分析',
    description: '深入分析指标异动根因，定位问题关键驱动因素',
    icon: Search,
    color: '#E8684A',
    bgLight: '#FDE8E4',
    href: '/workspace/ai-insight?focus=root-cause',
  },
  {
    id: 'insight',
    title: 'AI 数据洞察报告',
    description: '自动生成数据洞察报告，发现隐藏的业务规律',
    icon: FileBarChart,
    color: '#5B8FF9',
    bgLight: '#E8EEFB',
    href: '/workspace/ai-insight',
  },
  {
    id: 'diagnosis',
    title: 'AI 指标诊断',
    description: '对关键指标进行健康诊断，评估业务运行状态',
    icon: Stethoscope,
    color: '#5AD8A6',
    bgLight: '#E4F8EF',
    href: '/workspace/ai-insight?focus=diagnosis',
  },
  {
    id: 'dispatch',
    title: 'AI 智能调度',
    description: '基于业务规则和AI模型，智能推荐资源调度方案',
    icon: CalendarClock,
    color: '#F6BD16',
    bgLight: '#FEF7E0',
    href: '/portal/capability/dispatch/overview',
  },
  {
    id: 'strategy',
    title: 'AI 辅助定策',
    description: '结合数据与经验，智能推荐策略方案并预测效果',
    icon: Lightbulb,
    color: '#9270CA',
    bgLight: '#EDE4F6',
    href: '/portal/capability/strategy/overview',
  },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSend = () => {
    if (!quickInput.trim()) return;
    // 跳转到AI洞察助手，携带用户输入作为初始消息
    const encoded = encodeURIComponent(quickInput.trim());
    window.location.href = `/workspace/ai-insight?message=${encoded}`;
  };

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          style={{ background: 'linear-gradient(135deg, #0085D0 0%, #0066A3 100%)' }}
        >
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          {/* 呼吸动画光圈 */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#0085D0' }} />
        </button>
      )}

      {/* 导航面板 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #0085D0 0%, #0066A3 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI 赋能助手</h3>
                <p className="text-white/70 text-xs">智能运营，数据驱动</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* 能力导航列表 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800">选择AI能力</h4>
              <p className="text-xs text-gray-500 mt-1">点击进入对应功能页面</p>
            </div>
            <div className="space-y-3">
              {AI_CAPABILITIES.map(cap => {
                const Icon = cap.icon;
                return (
                  <Link
                    key={cap.id}
                    href={cap.href}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: cap.bgLight }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cap.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{cap.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{cap.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 快捷输入 */}
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuickSend()}
                  placeholder="快速提问，回车跳转AI洞察助手..."
                  className="w-full h-10 px-4 pr-12 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-colors"
                />
              </div>
              <button
                onClick={handleQuickSend}
                disabled={!quickInput.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0085D0 0%, #0066A3 100%)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
