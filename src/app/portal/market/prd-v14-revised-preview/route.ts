import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    // 提取Word文档内容
    const prdContent = extractDocxContent();

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>市场运营平台首页 PRD v14修订版</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
            color: #333;
            line-height: 1.8;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #1890ff;
            padding-bottom: 20px;
        }
        .version-info {
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .section {
            margin: 30px 0;
        }
        h2 {
            color: #0050b3;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-left: 15px;
            border-left: 4px solid #1890ff;
        }
        h3 {
            color: #2c3e50;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px 0;
        }
        p, li {
            color: #555;
            margin: 8px 0;
        }
        ul {
            padding-left: 20px;
        }
        .module-card {
            background: #fafafa;
            border: 1px solid #e8e8e8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .module-card h3 {
            margin-top: 0;
            color: #1890ff;
        }
        .download-section {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e8e8e8;
        }
        .download-btn {
            display: inline-block;
            padding: 16px 50px;
            background: #52c41a;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .download-btn:hover {
            background: #389e0d;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>市场运营平台首页 PRD v14修订版</h1>

        <div class="warning">
            <strong>⚠️ 重要修改：</strong>本版本移除了地市数据对比功能，详情模块只展示趋势图。
        </div>

        <div class="version-info">
            <h3>📄 文档信息</h3>
            <p><strong>文档版本：</strong>v14修订版</p>
            <p><strong>创建日期：</strong>2025-03-14</p>
            <p><strong>适用系统：</strong>市场运营平台首页</p>
        </div>

        ${prdContent}

        <div class="download-section">
            <a href="/api/download-prd-v14-revised" class="download-btn">下载完整Word文档</a>
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
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractDocxContent(): string {
  try {
    const pythonScript = `
from docx import Document
import re

doc = Document('/tmp/市场运营平台首页PRD_v14_修订版.docx')

content = []
current_section = ""
current_subsection = ""

for para in doc.paragraphs:
    text = para.text.strip()
    
    # 主章节
    match = re.match(r'^(\\d+)\\s+([^\\n]+)$', text)
    if match:
        if content:
            content.append('</div>')
        content.append(f'<div class="section"><h2>{match.group(1)}. {match.group(2)}</h2>')
        continue
    
    # 功能模块
    module_match = re.match(r'^(\\d+\\.\\d+\\.\\d+)\\s+(.+)$', text)
    if module_match:
        content.append(f'<div class="module-card"><h3>{module_match.group(1)} {module_match.group(2)}</h3>')
        continue
    
    # 小节
    if text.startswith('•'):
        section_name = text.replace('•', '').strip()
        content.append(f'<p><strong>{section_name}</strong></p>')
    elif text and len(text) > 5:
        content.append(f'<p>{text}</p>')

if content:
    content.append('</div>')

print('\\n'.join(content))
`;
    const result = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: '/tmp'
    });
    return result || '';
  } catch (error) {
    console.error('Extract docx content error:', error);
    return '<p>无法提取文档内容</p>';
  }
}
