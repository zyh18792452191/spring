import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // 读取已生成的 PRD 内容文件
    let content = '';
    try {
      const filePath = '/tmp/prd_full_content.txt';
      content = readFileSync(filePath, 'utf-8');
    } catch {
      // 如果文件不存在，返回简单提示
      content = 'PRD内容正在生成中，请稍后刷新页面...';
    }

    // 返回 HTML 页面
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>市场运营平台首页 PRD 预览</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
            color: #333;
            line-height: 1.8;
        }
        .container {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1890ff;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.8;
        }
        .buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            color: white;
        }
        .btn-primary {
            background: #1890ff;
        }
        .btn-secondary {
            background: #666;
        }
        .btn:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>市场运营平台首页 PRD 预览</h1>
        <pre>${escapeHtml(content)}</pre>
        <div class="buttons">
            <button class="btn btn-primary" onclick="window.print()">打印预览</button>
            <button class="btn btn-secondary" onclick="location.reload()">刷新</button>
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error rendering PRD preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
