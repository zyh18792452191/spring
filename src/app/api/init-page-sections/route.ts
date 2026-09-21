import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * 初始化page_sections表
 * POST /api/init-page-sections
 */
export async function POST(request: NextRequest) {
  try {
    // page_sections表的创建SQL
    const pageSectionsSQL = `
-- 创建页面区域表
CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL,
  section_code VARCHAR(100) NOT NULL,
  section_name VARCHAR(200) NOT NULL,
  section_type VARCHAR(50) NOT NULL DEFAULT 'CONTENT',
  section_config TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE(page_id, section_code)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_status ON page_sections(status);

-- 创建更新时间戳触发器
CREATE TRIGGER update_page_sections_updated_at
BEFORE UPDATE ON page_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
    `;

    // 由于Supabase JS客户端的限制，我们无法直接执行原始SQL
    // 返回SQL内容，提示用户手动执行
    return NextResponse.json({
      success: false,
      message: '请手动执行以下SQL脚本来初始化page_sections表',
      sql: pageSectionsSQL,
      instructions: [
        '1. 打开 Supabase 的 SQL Editor',
        '2. 复制下方显示的 SQL 脚本',
        '3. 粘贴到 SQL Editor 中并执行',
      ],
    });
  } catch (error) {
    console.error('初始化page_sections表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
