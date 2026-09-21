'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

/**
 * 精益运营 iframe 容器页面
 * 
 * 短期方案：通过4A票据透传 + iframe嵌入精益平台页面
 * 所有精益运营菜单项路由均指向此页面，根据路由路径映射到精益平台原始URL
 * 
 * 4A透传流程：
 * 1. 用户点击精益运营菜单 → 前端路由到此页面
 * 2. 后端调用4A CreateAiuapTokenSoap申请Token（SOAP + 3DES加密）
 * 3. 4A返回TOKEN+APPACCTID
 * 4. 前端iframe拼接精益平台URL + Token参数
 * 5. 精益平台调用4A CheckAiuapTokenSoap验证Token
 * 6. 验证通过 → 精益平台隐藏自身导航，展示内容区
 */

// 路由路径 → 精益平台原始URL路径映射
const ROUTE_MAP: Record<string, string> = {
  '/portal/lean/cockpit': '/cockpit',
  '/portal/lean/pre-warning/task-manage': '/pre-warning/task-manage',
  '/portal/lean/pre-warning/task-approval': '/pre-warning/task-approval',
  '/portal/lean/pre-warning/ticket-manage': '/pre-warning/ticket-manage',
  '/portal/lean/pre-warning/ticket-manage/retain': '/pre-warning/ticket-manage/retain',
  '/portal/lean/pre-warning/ticket-manage/retain-approval': '/pre-warning/ticket-manage/retain-approval',
  '/portal/lean/pre-warning/custody-monitor': '/pre-warning/custody-monitor',
  '/portal/lean/task-workbench/my-retain-task': '/task-workbench/my-retain-task',
  '/portal/lean/task-workbench/my-supervision-task': '/task-workbench/my-supervision-task',
  '/portal/lean/in-process/frontline-monitor': '/in-process/frontline-monitor',
  '/portal/lean/in-process/centralized-monitor': '/in-process/centralized-monitor',
  '/portal/lean/supervision/manage': '/supervision/manage',
  '/portal/lean/evaluation/port-out-analysis': '/evaluation/port-out-analysis',
  '/portal/lean/evaluation/broadband-churn-analysis': '/evaluation/broadband-churn-analysis',
  '/portal/lean/evaluation/globalton-churn-analysis': '/evaluation/globalton-churn-analysis',
  '/portal/lean/evaluation/complaint-analysis': '/evaluation/complaint-analysis',
  '/portal/lean/evaluation/hotline-analysis': '/evaluation/hotline-analysis',
  '/portal/lean/evaluation/anomaly-analysis': '/evaluation/anomaly-analysis',
  '/portal/lean/evaluation/churn-trace-analysis': '/evaluation/churn-trace-analysis',
  '/portal/lean/evaluation/suspend-winback-analysis': '/evaluation/suspend-winback-analysis',
  '/portal/lean/evaluation/tietong-winback-analysis': '/evaluation/tietong-winback-analysis',
  '/portal/lean/evaluation/case-analysis': '/evaluation/case-analysis',
  '/portal/lean/evaluation/dashboard': '/evaluation/dashboard',
  '/portal/lean/system/screen-manage': '/system/screen-manage',
};

// 精益平台基础URL（从环境变量读取，开发阶段可配置）
const LEAN_BASE_URL = process.env.NEXT_PUBLIC_LEAN_PLATFORM_URL || 'https://lean.xj.chinamobile.com';

export default function LeanPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  // 从路由参数还原完整路径
  const slug = params.slug as string[];
  const currentPath = slug ? `/portal/lean/${slug.join('/')}` : '/portal/lean/cockpit';

  // 获取4A Token
  const fetchSsoToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/sso/lean-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: ROUTE_MAP[currentPath] || '' }),
      });

      if (!response.ok) {
        throw new Error(`4A Token申请失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.message || '4A Token申请失败');
      }

      return data.token as string;
    } catch (err) {
      console.error('4A Token申请异常:', err);
      throw err;
    }
  }, [currentPath]);

  useEffect(() => {
    let cancelled = false;

    async function initIframe() {
      try {
        setLoading(true);
        setError(null);

        const leanPath = ROUTE_MAP[currentPath];
        if (!leanPath) {
          setError(`未找到路由映射: ${currentPath}`);
          setLoading(false);
          return;
        }

        // 短期方案：4A票据透传
        // 中期方案落地后，此处将替换为运营平台原生页面
        const token = await fetchSsoToken();

        if (cancelled) return;

        // 拼接精益平台URL，附带Token和iframe标识
        const url = new URL(leanPath, LEAN_BASE_URL);
        url.searchParams.set('token', token);
        url.searchParams.set('iframe', 'true'); // 通知精益平台壳剥离
        url.searchParams.set('hideNav', 'true'); // 隐藏精益平台导航

        setIframeUrl(url.toString());
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
          setLoading(false);
        }
      }
    }

    initIframe();
    return () => { cancelled = true; };
  }, [currentPath, fetchSsoToken]);

  // iframe高度自适应：监听精益页面高度变化
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // 验证消息来源
      if (!LEAN_BASE_URL.startsWith(event.origin)) return;

      if (event.data?.type === 'lean-page-height') {
        const iframe = document.getElementById('lean-iframe') as HTMLIFrameElement;
        if (iframe && event.data.height) {
          iframe.style.height = `${event.data.height}px`;
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
        <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
        <p className="text-lg font-medium mb-2">精益平台加载失败</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm">正在连接精益平台...</p>
        <p className="text-xs text-muted-foreground mt-1">4A认证中，请稍候</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-120px)]">
      <iframe
        id="lean-iframe"
        src={iframeUrl}
        className="w-full h-full border-0"
        title="精益运营"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
